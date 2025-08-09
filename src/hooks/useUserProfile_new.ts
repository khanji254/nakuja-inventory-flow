import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserProfile, Team, UserRole } from '@/types';
import { localStorageService } from '@/lib/storage-service';
import { UserManagementService, ExtendedUser } from '@/lib/user-management-service';

// Convert ExtendedUser to UserProfile format
const convertToUserProfile = (user: ExtendedUser): UserProfile => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    team: user.team as Team,
    avatar: user.avatar || '',
    phone: user.phone,
    department: user.department || '',
    joinDate: user.joinedDate,
    bio: user.bio || '',
    skills: user.skills || [],
    preferences: {
      theme: 'system',
      notifications: true,
      emailUpdates: true,
      language: 'en'
    },
    lastLogin: user.lastLogin
  };
};

// Simulate API calls with real user management integration
const profileAPI = {
  getUserProfile: async (): Promise<UserProfile> => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No current user found');
    }

    const currentUser = JSON.parse(userData);
    const userId = currentUser.id;

    // Get user from UserManagementService
    const user = await UserManagementService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return convertToUserProfile(user);
  },

  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    // Get current user ID
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('No current user found');
    }
    
    const currentUser = JSON.parse(userData);
    const userId = currentUser.id;

    // Get existing user data
    const existingUser = await UserManagementService.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Merge the profile data with existing user data
    const updatedUserData = {
      name: profileData.name || existingUser.name,
      email: profileData.email || existingUser.email,
      phone: profileData.phone || existingUser.phone,
      role: existingUser.role, // Keep existing role unless explicitly changed
      team: profileData.team || existingUser.team,
      status: existingUser.status,
      bio: profileData.bio !== undefined ? profileData.bio : existingUser.bio || '',
      skills: profileData.skills || existingUser.skills || [],
      department: profileData.department !== undefined ? profileData.department : existingUser.department || ''
    };

    // Update user through UserManagementService
    const updatedUser = await UserManagementService.updateUser(userId, updatedUserData);
    
    // Update localStorage user data if email or name changed
    if (profileData.name || profileData.email) {
      const newUserData = {
        ...currentUser,
        name: updatedUser.name,
        email: updatedUser.email
      };
      localStorage.setItem('user', JSON.stringify(newUserData));
    }

    return convertToUserProfile(updatedUser);
  },

  updateUserPreferences: async (preferences: UserProfile['preferences']): Promise<UserProfile> => {
    // Get current profile
    const profile = await profileAPI.getUserProfile();
    
    // Update preferences in localStorage
    const updatedProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...preferences }
    };
    
    localStorageService.setItem('userProfile', updatedProfile);
    return updatedProfile;
  }
};

// React Query hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: profileAPI.getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileAPI.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: profileAPI.updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};

// Additional hooks for user management
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: UserManagementService.getAllUsers,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserManagementService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      UserManagementService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: UserManagementService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
