import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/lib/permissions';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return {
        ...data,
        role: data.role as UserRole
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserTeam = () => {
  const { data: profile } = useUserProfile();
  
  return useQuery({
    queryKey: ['userTeam', profile?.team_id],
    queryFn: async (): Promise<Team | null> => {
      if (!profile?.team_id) return null;
      
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile.team_id)
        .single();
      
      if (error) {
        console.error('Error fetching team:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!profile?.team_id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profileData.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        role: data.role as UserRole
      };
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile', updatedProfile.user_id], updatedProfile);
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error updating profile',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ teamId, updates }: { teamId: string; updates: Partial<Team> }): Promise<Team> => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (updatedTeam) => {
      queryClient.setQueryData(['userTeam', updatedTeam.id], updatedTeam);
      toast({
        title: 'Team updated successfully',
        description: 'Team changes have been saved.',
      });
    },
    onError: () => {
      toast({
        title: 'Error updating team',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  });
};