import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  teamId?: string
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: UserRole
  teamId?: string
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isActive: true }
      })
      
      return user ? user.isActive : false
    } catch (error) {
      return false
    }
  }

  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const { email, password } = credentials

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        team: true
      }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password)
    if (!isValidPassword) {
      throw new Error('Invalid email or password')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Log the login
    await this.logAuditAction(user.id, 'LOGIN', 'users', user.id)

    // Generate token
    const token = this.generateToken(user.id)

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId || undefined,
      permissions: user.permissions
    }

    return { user: authUser, token }
  }

  static async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    const { name, email, password, role = 'MEMBER', teamId } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password)

    // Set default permissions based on role
    const permissions = this.getDefaultPermissions(role)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        teamId,
        permissions
      },
      include: {
        team: true
      }
    })

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        joinDate: new Date(),
        preferences: {
          theme: 'system',
          notifications: true,
          emailUpdates: true,
          language: 'en'
        }
      }
    })

    // Log the registration
    await this.logAuditAction(user.id, 'CREATE', 'users', user.id)

    // Generate token
    const token = this.generateToken(user.id)

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId || undefined,
      permissions: user.permissions
    }

    return { user: authUser, token }
  }

  static async getCurrentUser(token: string): Promise<AuthUser> {
    try {
      const { userId } = this.verifyToken(token)

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          team: true
        }
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId || undefined,
        permissions: user.permissions
      }
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  static async logout(token: string): Promise<void> {
    try {
      const { userId } = this.verifyToken(token)
      await this.logAuditAction(userId, 'LOGOUT', 'users', userId)
    } catch (error) {
      // Silent fail for logout
    }
  }

  static getDefaultPermissions(role: UserRole): string[] {
    const permissions: Record<UserRole, string[]> = {
      SUPER_ADMIN: [
        'READ_ALL', 'WRITE_ALL', 'DELETE_ALL', 'ADMIN_ALL',
        'MANAGE_USERS', 'MANAGE_TEAMS', 'APPROVE_PURCHASES',
        'MANAGE_INVENTORY', 'VIEW_AUDIT_LOGS', 'SYSTEM_CONFIG'
      ],
      ADMIN: [
        'READ_ALL', 'WRITE_ALL', 'DELETE_ALL',
        'MANAGE_USERS', 'MANAGE_TEAMS', 'APPROVE_PURCHASES',
        'MANAGE_INVENTORY', 'VIEW_AUDIT_LOGS'
      ],
      SUPERVISOR: [
        'READ_ALL', 'WRITE_TEAM', 'VIEW_AUDIT_LOGS'
      ],
      TEAM_LEAD: [
        'READ_TEAM', 'WRITE_TEAM', 'DELETE_TEAM',
        'MANAGE_TEAM_USERS', 'APPROVE_TEAM_PURCHASES'
      ],
      PURCHASING_LEAD: [
        'READ_ALL', 'WRITE_PURCHASES', 'APPROVE_PURCHASES'
      ],
      INVENTORY_LEAD: [
        'READ_ALL', 'WRITE_INVENTORY', 'MANAGE_INVENTORY'
      ],
      MEMBER: [
        'READ_TEAM', 'WRITE_OWN', 'CREATE_REQUESTS'
      ]
    }

    return permissions[role] || permissions.MEMBER
  }

  static async logAuditAction(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT',
    tableName: string,
    recordId: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          tableName,
          recordId,
          oldValues: oldValues || null,
          newValues: newValues || null,
          changes: oldValues && newValues ? this.calculateChanges(oldValues, newValues) : null
        }
      })
    } catch (error) {
      console.error('Failed to log audit action:', error)
    }
  }

  static calculateChanges(oldValues: any, newValues: any): any {
    const changes: any = {}
    
    for (const key in newValues) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key]
        }
      }
    }
    
    return changes
  }

  // Permission checking methods
  static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes('ADMIN_ALL')
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
