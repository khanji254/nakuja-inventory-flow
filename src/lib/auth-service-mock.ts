import { ROLE_PERMISSIONS, UserRole } from './permissions'

// Mock authentication service for client-side development
// In production, these would be API calls to your backend

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: UserRole
  teamId?: string
}

interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  teamId?: string
  permissions: string[]
}

// Mock users for development
const mockUsers: AuthUser[] = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@nakuja.org',
    role: 'SUPER_ADMIN',
    permissions: ROLE_PERMISSIONS.SUPER_ADMIN
  },
  {
    id: '2',
    name: 'John Admin',
    email: 'john.admin@nakuja.org',
    role: 'ADMIN',
    teamId: 'recovery',
    permissions: ROLE_PERMISSIONS.ADMIN
  },
  {
    id: '3',
    name: 'Alex Lead',
    email: 'alex.lead@nakuja.org',
    role: 'TEAM_LEAD',
    teamId: 'recovery',
    permissions: ROLE_PERMISSIONS.TEAM_LEAD
  },
  {
    id: '4',
    name: 'Jane Member',
    email: 'jane.member@nakuja.org',
    role: 'MEMBER',
    teamId: 'recovery',
    permissions: ROLE_PERMISSIONS.MEMBER
  },
  {
    id: '5',
    name: 'Sarah Purchasing',
    email: 'sarah.purchasing@nakuja.org',
    role: 'PURCHASING_LEAD',
    teamId: 'avionics',
    permissions: ROLE_PERMISSIONS.PURCHASING_LEAD
  },
  {
    id: '6',
    name: 'Mike Inventory',
    email: 'mike.inventory@nakuja.org',
    role: 'INVENTORY_LEAD',
    teamId: 'avionics',
    permissions: ROLE_PERMISSIONS.INVENTORY_LEAD
  },
  {
    id: '7',
    name: 'Lisa Supervisor',
    email: 'lisa.supervisor@nakuja.org',
    role: 'SUPERVISOR',
    permissions: ROLE_PERMISSIONS.SUPERVISOR
  }
]

// Mock password validation (in real app, this would be server-side)
const mockPasswords: Record<string, string> = {
  'admin@nakuja.org': 'admin123',
  'john.admin@nakuja.org': 'admin123',
  'alex.lead@nakuja.org': 'lead123',
  'jane.member@nakuja.org': 'member123',
  'sarah.purchasing@nakuja.org': 'purchasing123',
  'mike.inventory@nakuja.org': 'inventory123',
  'lisa.supervisor@nakuja.org': 'supervisor123'
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = credentials

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Find mock user
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user || mockPasswords[email.toLowerCase()] !== password) {
      throw new Error('Invalid email or password')
    }

    // Generate mock JWT token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 24 * 60 * 60 * 1000 }))

    return { user, token }
  }

  static async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    const { name, email, password, role, teamId } = data

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Create new user
    const newUser: AuthUser = {
      id: String(mockUsers.length + 1),
      name,
      email: email.toLowerCase(),
      role,
      teamId,
      permissions: ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.MEMBER
    }

    // Add to mock database
    mockUsers.push(newUser)
    mockPasswords[email.toLowerCase()] = password

    // Generate mock JWT token
    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, exp: Date.now() + 24 * 60 * 60 * 1000 }))

    return { user: newUser, token }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = JSON.parse(atob(token))
      return decoded.exp > Date.now()
    } catch {
      return false
    }
  }

  static async getCurrentUser(token: string): Promise<AuthUser> {
    const decoded = JSON.parse(atob(token))
    const user = mockUsers.find(u => u.id === decoded.userId)
    
    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  static getDefaultPermissions(role: UserRole): string[] {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.MEMBER
  }

  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission)
  }

  static canAccessTeam(user: AuthUser, teamId: string): boolean {
    if (this.hasPermission(user, 'READ_ALL') || this.hasPermission(user, 'ADMIN_ALL')) {
      return true
    }
    
    if (user.teamId === teamId && this.hasPermission(user, 'READ_TEAM')) {
      return true
    }
    
    return false
  }

  static canEditTeam(user: AuthUser, teamId: string): boolean {
    if (this.hasPermission(user, 'WRITE_ALL') || this.hasPermission(user, 'ADMIN_ALL')) {
      return true
    }
    
    if (user.teamId === teamId && this.hasPermission(user, 'WRITE_TEAM')) {
      return true
    }
    
    return false
  }

  static canApprovePurchase(user: AuthUser, teamId?: string): boolean {
    if (this.hasPermission(user, 'APPROVE_PURCHASES')) {
      return true
    }
    
    if (teamId && user.teamId === teamId && this.hasPermission(user, 'APPROVE_TEAM_PURCHASES')) {
      return true
    }
    
    return false
  }
}
