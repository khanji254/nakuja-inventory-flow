import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  team: string;
  phone?: string;
  department?: string;
  bio?: string;
  skills?: string[];
  joinDate?: Date;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}

export const useUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async (): Promise<UserProfile> => {
      if (!user) throw new Error('No user authenticated');
      
      // Mock profile data based on auth user
      return {
        id: user.id,
        name: user.email || 'User',
        email: user.email || '',
        role: 'team-member',
        team: 'Avionics',
        phone: '',
        department: '',
        bio: '',
        skills: [],
        joinDate: new Date(),
        avatar: '',
        preferences: {
          theme: 'system',
          notifications: true,
          emailUpdates: true,
          language: 'en'
        }
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      // Mock update - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentProfile = queryClient.getQueryData(['userProfile']) as UserProfile;
      const updatedProfile = { ...currentProfile, ...profileData };
      
      return updatedProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile'], updatedProfile);
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