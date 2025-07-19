import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, Team, UserRole } from '@/types';
import { localStorageService } from '@/lib/storage-service';

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@nakuja.com',
  role: 'team-lead',
  team: 'Avionics',
  avatar: '',
  phone: '+254 700 123 456',
  department: 'Engineering',
  joinDate: new Date('2023-01-15'),
  bio: 'Experienced avionics engineer with a passion for rocket systems and electronics design.',
  skills: ['React', 'TypeScript', 'Python', 'Electronics', 'CAD Design'],
  preferences: {
    theme: 'system',
    notifications: true,
    emailUpdates: true,
    language: 'en'
  },
  lastLogin: new Date()
};

// Simulate API calls
const profileAPI = {
  getUserProfile: async (): Promise<UserProfile> => {
    // Try to get from localStorage first
    const stored = localStorageService.getItem('userProfile');
    if (stored && typeof stored === 'object') {
      const storedProfile = stored as any;
      return {
        ...storedProfile,
        joinDate: new Date(storedProfile.joinDate || '2023-01-15'),
        lastLogin: storedProfile.lastLogin ? new Date(storedProfile.lastLogin) : new Date()
      } as UserProfile;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Save to localStorage and return
    localStorageService.setItem('userProfile', mockUserProfile);
    return mockUserProfile;
  },

  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Get current profile
    const storedProfile = localStorageService.getItem('userProfile');
    let current: UserProfile;
    
    if (storedProfile && typeof storedProfile === 'object' && storedProfile !== null) {
      const stored = storedProfile as any;
      current = {
        ...stored,
        joinDate: new Date(stored.joinDate || '2023-01-15'),
        lastLogin: stored.lastLogin ? new Date(stored.lastLogin) : new Date()
      } as UserProfile;
    } else {
      current = mockUserProfile;
    }
    
    // Update profile
    const updated: UserProfile = {
      ...current,
      ...profileData,
      id: current.id, // Ensure ID doesn't change
      lastLogin: new Date() // Update last login
    };
    
    // Save to localStorage
    localStorageService.setItem('userProfile', updated);
    
    return updated;
  }
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: profileAPI.getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileAPI.updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
