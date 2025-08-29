-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEAM_LEAD', 'MEMBER')),
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  phone TEXT,
  department TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  cost_per_unit DECIMAL(10,2),
  supplier TEXT,
  location TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase requests table
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  estimated_cost DECIMAL(10,2),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  justification TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create BOM (Bill of Materials) table
CREATE TABLE public.bom_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL,
  unit TEXT,
  estimated_cost DECIMAL(10,2),
  category TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to get user team
CREATE OR REPLACE FUNCTION public.get_user_team(user_uuid UUID)
RETURNS UUID AS $$
  SELECT team_id FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for teams
CREATE POLICY "Users can view their team" ON public.teams
  FOR SELECT USING (
    id = public.get_user_team(auth.uid()) OR 
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN')
  );

CREATE POLICY "Team leads can update their team" ON public.teams
  FOR UPDATE USING (
    id = public.get_user_team(auth.uid()) AND 
    public.get_user_role(auth.uid()) IN ('TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN')
  );

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- RLS Policies for profiles
CREATE POLICY "Users can view team profiles" ON public.profiles
  FOR SELECT USING (
    team_id = public.get_user_team(auth.uid()) OR 
    user_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN')
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('ADMIN', 'SUPER_ADMIN'));

-- RLS Policies for inventory
CREATE POLICY "Users can view team inventory" ON public.inventory
  FOR SELECT USING (
    team_id = public.get_user_team(auth.uid()) OR 
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN')
  );

CREATE POLICY "Team leads can edit inventory" ON public.inventory
  FOR ALL USING (
    team_id = public.get_user_team(auth.uid()) AND 
    public.get_user_role(auth.uid()) IN ('TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN')
  );

-- RLS Policies for purchase requests
CREATE POLICY "Users can view team purchase requests" ON public.purchase_requests
  FOR SELECT USING (
    team_id = public.get_user_team(auth.uid()) OR 
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN')
  );

CREATE POLICY "Team members can create purchase requests" ON public.purchase_requests
  FOR INSERT WITH CHECK (
    team_id = public.get_user_team(auth.uid()) AND
    requested_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own requests" ON public.purchase_requests
  FOR UPDATE USING (
    requested_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND
    status = 'pending'
  );

CREATE POLICY "Team leads can approve requests" ON public.purchase_requests
  FOR UPDATE USING (
    team_id = public.get_user_team(auth.uid()) AND 
    public.get_user_role(auth.uid()) IN ('TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN')
  );

-- RLS Policies for BOM
CREATE POLICY "Users can view team BOM" ON public.bom_items
  FOR SELECT USING (
    team_id = public.get_user_team(auth.uid()) OR 
    public.get_user_role(auth.uid()) IN ('SUPER_ADMIN', 'ADMIN')
  );

CREATE POLICY "Team leads can manage BOM" ON public.bom_items
  FOR ALL USING (
    team_id = public.get_user_team(auth.uid()) AND 
    public.get_user_role(auth.uid()) IN ('TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN')
  );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchase_requests_updated_at BEFORE UPDATE ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bom_items_updated_at BEFORE UPDATE ON public.bom_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default team
INSERT INTO public.teams (name, description) VALUES ('Recovery Team', 'Primary recovery operations team');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role, team_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'MEMBER',
    (SELECT id FROM public.teams WHERE name = 'Recovery Team' LIMIT 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();