-- Create super admin account
INSERT INTO public.profiles (user_id, email, name, role, team_id)
SELECT 
  id,
  email,
  'Super Admin',
  'SUPER_ADMIN',
  (SELECT id FROM public.teams WHERE name = 'Recovery Team' LIMIT 1)
FROM auth.users 
WHERE email = 'admin@nakuja.org'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'SUPER_ADMIN',
  name = 'Super Admin';

-- If no super admin exists in auth.users, we'll need to create one manually through Supabase dashboard
-- But let's also ensure we have a test super admin account for development
-- Note: In production, create this account through the Supabase dashboard