import { UserRole, ROLE_PERMISSIONS } from './permissions';

export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  team: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin: Date;
  joinedDate: Date;
  permissions: string[];
  bio?: string;
  skills?: string[];
  department?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  team: string;
  status: 'active' | 'inactive' | 'pending';
  bio?: string;
  skills?: string[];
  department?: string;
  password: string;
}

export interface UpdateUserData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  team: string;
  status: 'active' | 'inactive' | 'pending';
  bio?: string;
  skills?: string[];
  department?: string;
}

// Mock user database for development
let mockUsers: ExtendedUser[] = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@nakuja.org',
    phone: '+1 (555) 000-0001',
    role: 'SUPER_ADMIN',
    team: 'All Teams',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-16'),
    joinedDate: new Date('2023-01-01'),
    permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
    bio: 'System administrator with full access to all features',
    skills: ['System Administration', 'Security', 'Database Management'],
    department: 'IT'
  },
  {
    id: '2',
    name: 'John Admin',
    email: 'john.admin@nakuja.org',
    phone: '+1 (555) 000-0002',
    role: 'ADMIN',
    team: 'Recovery',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-16'),
    joinedDate: new Date('2023-02-01'),
    permissions: ROLE_PERMISSIONS.ADMIN,
    bio: 'Recovery team administrator',
    skills: ['Project Management', 'Team Leadership', 'Recovery Systems'],
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Alex Lead',
    email: 'alex.lead@nakuja.org',
    phone: '+1 (555) 000-0003',
    role: 'TEAM_LEAD',
    team: 'Recovery',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-15'),
    joinedDate: new Date('2023-03-01'),
    permissions: ROLE_PERMISSIONS.TEAM_LEAD,
    bio: 'Lead engineer for recovery team',
    skills: ['Mechanical Engineering', 'CAD Design', 'Testing'],
    department: 'Engineering'
  },
  {
    id: '4',
    name: 'Jane Member',
    email: 'jane.member@nakuja.org',
    phone: '+1 (555) 000-0004',
    role: 'MEMBER',
    team: 'Recovery',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-14'),
    joinedDate: new Date('2023-04-01'),
    permissions: ROLE_PERMISSIONS.MEMBER,
    bio: 'Recovery team member specializing in parachute systems',
    skills: ['Parachute Design', 'Testing', 'Analysis'],
    department: 'Engineering'
  },
  {
    id: '5',
    name: 'Sarah Purchasing',
    email: 'sarah.purchasing@nakuja.org',
    phone: '+1 (555) 000-0005',
    role: 'PURCHASING_LEAD',
    team: 'Avionics',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-16'),
    joinedDate: new Date('2023-05-01'),
    permissions: ROLE_PERMISSIONS.PURCHASING_LEAD,
    bio: 'Purchasing lead managing procurement across all teams',
    skills: ['Procurement', 'Vendor Management', 'Cost Analysis'],
    department: 'Operations'
  },
  {
    id: '6',
    name: 'Mike Inventory',
    email: 'mike.inventory@nakuja.org',
    phone: '+1 (555) 000-0006',
    role: 'INVENTORY_LEAD',
    team: 'Avionics',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-15'),
    joinedDate: new Date('2023-06-01'),
    permissions: ROLE_PERMISSIONS.INVENTORY_LEAD,
    bio: 'Inventory management specialist',
    skills: ['Inventory Management', 'Logistics', 'Database Management'],
    department: 'Operations'
  },
  {
    id: '7',
    name: 'Lisa Supervisor',
    email: 'lisa.supervisor@nakuja.org',
    phone: '+1 (555) 000-0007',
    role: 'SUPERVISOR',
    team: 'All Teams',
    status: 'active',
    avatar: '/placeholder.svg',
    lastLogin: new Date('2024-01-16'),
    joinedDate: new Date('2023-07-01'),
    permissions: ROLE_PERMISSIONS.SUPERVISOR,
    bio: 'Cross-team supervisor overseeing multiple projects',
    skills: ['Project Management', 'Cross-team Coordination', 'Quality Assurance'],
    department: 'Management'
  }
];

// Password storage for mock authentication
let mockPasswords: Record<string, string> = {
  'admin@nakuja.org': 'admin123',
  'john.admin@nakuja.org': 'admin123',
  'alex.lead@nakuja.org': 'lead123',
  'jane.member@nakuja.org': 'member123',
  'sarah.purchasing@nakuja.org': 'purchasing123',
  'mike.inventory@nakuja.org': 'inventory123',
  'lisa.supervisor@nakuja.org': 'supervisor123'
};

export class UserManagementService {
  // Get all users
  static async getAllUsers(): Promise<ExtendedUser[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockUsers];
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ExtendedUser | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.find(user => user.id === id) || null;
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<ExtendedUser> {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (mockUsers.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    // Generate new ID
    const newId = String(Math.max(...mockUsers.map(u => parseInt(u.id)), 0) + 1);

    const newUser: ExtendedUser = {
      id: newId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: userData.role,
      team: userData.team,
      status: userData.status,
      avatar: '/placeholder.svg',
      lastLogin: new Date(),
      joinedDate: new Date(),
      permissions: ROLE_PERMISSIONS[userData.role] || ROLE_PERMISSIONS.MEMBER,
      bio: userData.bio || '',
      skills: userData.skills || [],
      department: userData.department || ''
    };

    // Add to mock database
    mockUsers.push(newUser);
    
    // Store password
    mockPasswords[userData.email.toLowerCase()] = userData.password;

    // Update auth service mock users as well
    this.syncWithAuthService(newUser, userData.password);

    return newUser;
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserData): Promise<ExtendedUser> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it conflicts with another user
    const existingUserWithEmail = mockUsers.find(user => 
      user.id !== id && user.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (existingUserWithEmail) {
      throw new Error('Email already in use by another user');
    }

    const oldEmail = mockUsers[userIndex].email;
    const updatedUser: ExtendedUser = {
      ...mockUsers[userIndex],
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: userData.role,
      team: userData.team,
      status: userData.status,
      bio: userData.bio || '',
      skills: userData.skills || [],
      department: userData.department || '',
      permissions: ROLE_PERMISSIONS[userData.role] || ROLE_PERMISSIONS.MEMBER
    };

    mockUsers[userIndex] = updatedUser;

    // Update password mapping if email changed
    if (oldEmail !== userData.email.toLowerCase()) {
      if (mockPasswords[oldEmail]) {
        mockPasswords[userData.email.toLowerCase()] = mockPasswords[oldEmail];
        delete mockPasswords[oldEmail];
      }
    }

    // Update auth service
    this.syncWithAuthService(updatedUser);

    return updatedUser;
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = mockUsers[userIndex];
    
    // Prevent deletion of super admin
    if (user.role === 'SUPER_ADMIN') {
      throw new Error('Cannot delete Super Admin user');
    }

    // Remove from mock database
    mockUsers.splice(userIndex, 1);
    
    // Remove password
    delete mockPasswords[user.email];

    // Remove from auth service
    this.removeFromAuthService(id);
  }

  // Reset user password
  static async resetPassword(id: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = mockUsers.find(user => user.id === id);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate temporary password
    const tempPassword = 'temp' + Math.random().toString(36).substring(2, 8);
    mockPasswords[user.email] = tempPassword;

    return tempPassword;
  }

  // Toggle user status
  static async toggleUserStatus(id: string): Promise<ExtendedUser> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = mockUsers[userIndex];
    user.status = user.status === 'active' ? 'inactive' : 'active';
    
    return user;
  }

  // Get users by team
  static async getUsersByTeam(teamId: string): Promise<ExtendedUser[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.filter(user => user.team === teamId);
  }

  // Get users by role
  static async getUsersByRole(role: UserRole): Promise<ExtendedUser[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUsers.filter(user => user.role === role);
  }

  // Sync with auth service (for authentication)
  private static syncWithAuthService(user: ExtendedUser, password?: string): void {
    try {
      // This would sync with the actual auth service
      // For now, we'll update the mock auth service data
      
      // Import and update auth service mock users
      const authServiceModule = require('./auth-service-mock');
      if (authServiceModule && authServiceModule.mockUsers) {
        const authUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          teamId: user.team.toLowerCase(),
          permissions: user.permissions
        };

        const existingIndex = authServiceModule.mockUsers.findIndex((u: any) => u.id === user.id);
        if (existingIndex >= 0) {
          authServiceModule.mockUsers[existingIndex] = authUser;
        } else {
          authServiceModule.mockUsers.push(authUser);
        }

        if (password) {
          authServiceModule.mockPasswords[user.email] = password;
        }
      }
    } catch (error) {
      console.warn('Could not sync with auth service:', error);
    }
  }

  private static removeFromAuthService(id: string): void {
    try {
      const authServiceModule = require('./auth-service-mock');
      if (authServiceModule && authServiceModule.mockUsers) {
        const userIndex = authServiceModule.mockUsers.findIndex((u: any) => u.id === id);
        if (userIndex >= 0) {
          const user = authServiceModule.mockUsers[userIndex];
          authServiceModule.mockUsers.splice(userIndex, 1);
          delete authServiceModule.mockPasswords[user.email];
        }
      }
    } catch (error) {
      console.warn('Could not remove from auth service:', error);
    }
  }

  // Search users
  static async searchUsers(query: string): Promise<ExtendedUser[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lowercaseQuery = query.toLowerCase();
    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(lowercaseQuery) ||
      user.email.toLowerCase().includes(lowercaseQuery) ||
      user.team.toLowerCase().includes(lowercaseQuery) ||
      user.department?.toLowerCase().includes(lowercaseQuery) ||
      user.skills?.some(skill => skill.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get user statistics
  static async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
    byTeam: Record<string, number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const roleStats = {} as Record<UserRole, number>;
    const teamStats = {} as Record<string, number>;

    mockUsers.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
      teamStats[user.team] = (teamStats[user.team] || 0) + 1;
    });

    return {
      total: mockUsers.length,
      active: mockUsers.filter(u => u.status === 'active').length,
      inactive: mockUsers.filter(u => u.status === 'inactive').length,
      byRole: roleStats,
      byTeam: teamStats
    };
  }
}
