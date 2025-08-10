import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Import app-level types separately from service/permissions types to resolve role casing differences
import type { UserProfile, Team, UserRole as AppUserRole } from '@/types';
import { localStorageService } from '@/lib/storage-service';
import { UserManagementService, ExtendedUser } from '@/lib/user-management-service';
import type { UserRole as Role } from '@/lib/permissions';

// Convert ExtendedUser to UserProfile format
const convertToUserProfile = (user: ExtendedUser): UserProfile => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // Cast service role (uppercase enum-like) to app role type (lowercase union)
    role: (user.role as unknown) as AppUserRole,
    team: (user.team as unknown) as Team,
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

// Convert UserProfile to ExtendedUser format for updates (not currently used but kept for reference)
const convertToExtendedUser = (profile: UserProfile, existingUser: ExtendedUser): ExtendedUser => {
  return {
    ...existingUser,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    // Cast app role to service role type
    role: (profile.role as unknown) as Role,
    team: (profile.team as unknown) as string,
    bio: profile.bio || '',
    skills: profile.skills || [],
    department: profile.department || ''
  };
};

// Simulate API calls with real user management integration
const profileAPI = {
  async getUserProfile(userId?: string): Promise<UserProfile> {
    // Get current user from localStorage if no userId provided
    if (!userId) {
      const userData = localStorage.getItem('user');
      if (userData) {
        const currentUser = JSON.parse(userData);
        userId = currentUser.id;
      }
    }

    if (!userId) {
      throw new Error('No user ID provided');
    }

    // Get user from UserManagementService
    const user = await UserManagementService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return convertToUserProfile(user);
  },

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
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
      name: profileData.name ?? existingUser.name,
      email: profileData.email ?? existingUser.email,
      phone: profileData.phone ?? existingUser.phone,
      // Cast app role to service role type when sending to service
      role: ((profileData.role as unknown) as Role) ?? existingUser.role,
      team: ((profileData.team as unknown) as string) ?? existingUser.team,
      status: existingUser.status,
      bio: profileData.bio ?? existingUser.bio ?? '',
      skills: profileData.skills ?? existingUser.skills ?? [],
      department: profileData.department ?? existingUser.department ?? ''
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

  async updateUserPreferences(preferences: UserProfile['preferences']): Promise<UserProfile> {
    // Get current profile
    const profile = await profileAPI.getUserProfile();

    // Update preferences and persist in localStorage
    const updatedProfile: UserProfile = {
      ...profile,
      preferences: { ...profile.preferences, ...preferences }
    };

    localStorageService.setItem('userProfile', updatedProfile);
    return updatedProfile;
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
