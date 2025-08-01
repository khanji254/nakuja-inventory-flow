// Role-Based Access Control System
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'TEAM_LEAD' | 'PURCHASING_LEAD' | 'INVENTORY_LEAD' | 'MEMBER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  teamId?: string
  permissions: string[]
}

// Permission Constants
export const PERMISSIONS = {
  // Admin permissions
  ADMIN_ALL: 'ADMIN_ALL',
  ADMIN_TEAM: 'ADMIN_TEAM',
  
  // Read permissions
  READ_ALL: 'READ_ALL',
  READ_TEAM: 'READ_TEAM',
  READ_OWN: 'READ_OWN',
  
  // Write permissions
  WRITE_ALL: 'WRITE_ALL',
  WRITE_TEAM: 'WRITE_TEAM',
  WRITE_OWN: 'WRITE_OWN',
  
  // Delete permissions
  DELETE_ALL: 'DELETE_ALL',
  DELETE_TEAM: 'DELETE_TEAM',
  DELETE_OWN: 'DELETE_OWN',
  
  // Specific function permissions
  APPROVE_PURCHASES: 'APPROVE_PURCHASES',
  APPROVE_TEAM_PURCHASES: 'APPROVE_TEAM_PURCHASES',
  WRITE_INVENTORY: 'WRITE_INVENTORY',
  MANAGE_TEAM: 'MANAGE_TEAM',
  MANAGE_USERS: 'MANAGE_USERS',
  ASSIGN_ROLES: 'ASSIGN_ROLES',
  
  // Dashboard and analytics
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_TEAM_ANALYTICS: 'VIEW_TEAM_ANALYTICS',
  
  // BOM permissions
  EDIT_BOM: 'EDIT_BOM',
  VIEW_BOM: 'VIEW_BOM',
  
  // Export permissions
  EXPORT_DATA: 'EXPORT_DATA',
  IMPORT_DATA: 'IMPORT_DATA'
} as const

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    PERMISSIONS.ADMIN_ALL,
    PERMISSIONS.READ_ALL,
    PERMISSIONS.WRITE_ALL,
    PERMISSIONS.DELETE_ALL,
    PERMISSIONS.APPROVE_PURCHASES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EDIT_BOM,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA
  ],
  
  ADMIN: [
    PERMISSIONS.ADMIN_TEAM,
    PERMISSIONS.READ_ALL,
    PERMISSIONS.WRITE_ALL,
    PERMISSIONS.APPROVE_TEAM_PURCHASES,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EDIT_BOM,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA
  ],
  
  SUPERVISOR: [
    PERMISSIONS.READ_ALL,
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_BOM,
    PERMISSIONS.EXPORT_DATA
  ],
  
  TEAM_LEAD: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.WRITE_TEAM,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.APPROVE_TEAM_PURCHASES,
    PERMISSIONS.ASSIGN_ROLES, // Team leads can assign roles to their team members
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.EDIT_BOM,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA
  ],
  
  PURCHASING_LEAD: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.APPROVE_PURCHASES,
    PERMISSIONS.APPROVE_TEAM_PURCHASES,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.VIEW_BOM,
    PERMISSIONS.EXPORT_DATA
  ],
  
  INVENTORY_LEAD: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.WRITE_INVENTORY,
    PERMISSIONS.VIEW_TEAM_ANALYTICS,
    PERMISSIONS.EDIT_BOM,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.IMPORT_DATA
  ],
  
  MEMBER: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.READ_OWN,
    PERMISSIONS.WRITE_OWN,
    PERMISSIONS.VIEW_BOM
  ]
}

// Permission check functions
export class PermissionManager {
  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission)
  }

  static canAccessTeam(user: User, teamId: string): boolean {
    // Super admin and admin can access all teams
    if (this.hasPermission(user, PERMISSIONS.READ_ALL) || this.hasPermission(user, PERMISSIONS.ADMIN_ALL)) {
      return true
    }
    
    // Supervisors can access all teams (read-only)
    if (user.role === 'SUPERVISOR') {
      return true
    }
    
    // Users can access their own team
    if (user.teamId === teamId && this.hasPermission(user, PERMISSIONS.READ_TEAM)) {
      return true
    }
    
    return false
  }

  static canEditTeam(user: User, teamId: string): boolean {
    // Super admin can edit all teams
    if (this.hasPermission(user, PERMISSIONS.ADMIN_ALL) || this.hasPermission(user, PERMISSIONS.WRITE_ALL)) {
      return true
    }
    
    // Admin can edit all teams
    if (user.role === 'ADMIN') {
      return true
    }
    
    // Team lead can edit their own team
    if (user.teamId === teamId && this.hasPermission(user, PERMISSIONS.WRITE_TEAM)) {
      return true
    }
    
    // Inventory lead can edit inventory for their team
    if (user.role === 'INVENTORY_LEAD' && user.teamId === teamId) {
      return true
    }
    
    return false
  }

  static canApprovePurchase(user: User, teamId?: string): boolean {
    // Global purchasing permission
    if (this.hasPermission(user, PERMISSIONS.APPROVE_PURCHASES)) {
      return true
    }
    
    // Team-specific purchasing permission
    if (teamId && user.teamId === teamId && this.hasPermission(user, PERMISSIONS.APPROVE_TEAM_PURCHASES)) {
      return true
    }
    
    return false
  }

  static canManageUsers(user: User): boolean {
    return this.hasPermission(user, PERMISSIONS.MANAGE_USERS)
  }

  static canAssignRoles(user: User, targetUser?: User): boolean {
    // Super admin can assign any role
    if (this.hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
      return true
    }
    
    // Team leads can assign roles within their team (except admin roles)
    if (user.role === 'TEAM_LEAD' && targetUser && user.teamId === targetUser.teamId) {
      // Team leads cannot create other team leads, admins, or super admins
      return !['TEAM_LEAD', 'ADMIN', 'SUPER_ADMIN'].includes(targetUser.role)
    }
    
    return false
  }

  static canEditInventory(user: User, teamId?: string): boolean {
    // Global inventory permission
    if (this.hasPermission(user, PERMISSIONS.WRITE_ALL) || this.hasPermission(user, PERMISSIONS.ADMIN_ALL)) {
      return true
    }
    
    // Inventory lead can edit inventory
    if (this.hasPermission(user, PERMISSIONS.WRITE_INVENTORY)) {
      return teamId ? user.teamId === teamId : true
    }
    
    // Team lead can edit their team's inventory
    if (user.role === 'TEAM_LEAD' && teamId === user.teamId) {
      return true
    }
    
    return false
  }

  static canEditBOM(user: User, teamId?: string): boolean {
    // Global BOM permission
    if (this.hasPermission(user, PERMISSIONS.WRITE_ALL) || this.hasPermission(user, PERMISSIONS.ADMIN_ALL)) {
      return true
    }
    
    // BOM edit permission
    if (this.hasPermission(user, PERMISSIONS.EDIT_BOM)) {
      return teamId ? user.teamId === teamId : true
    }
    
    return false
  }

  static canViewAnalytics(user: User): boolean {
    return this.hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) || 
           this.hasPermission(user, PERMISSIONS.VIEW_TEAM_ANALYTICS)
  }

  static canExportData(user: User): boolean {
    return this.hasPermission(user, PERMISSIONS.EXPORT_DATA)
  }

  static canImportData(user: User): boolean {
    return this.hasPermission(user, PERMISSIONS.IMPORT_DATA)
  }

  // Get allowed teams for user
  static getAllowedTeams(user: User, allTeams: string[]): string[] {
    if (this.hasPermission(user, PERMISSIONS.READ_ALL) || user.role === 'SUPERVISOR') {
      return allTeams
    }
    
    return user.teamId ? [user.teamId] : []
  }

  // Check if user can see other user's data
  static canViewUserData(currentUser: User, targetUser: User): boolean {
    // Super admin and admin can see all
    if (this.hasPermission(currentUser, PERMISSIONS.READ_ALL)) {
      return true
    }
    
    // Supervisors can see all
    if (currentUser.role === 'SUPERVISOR') {
      return true
    }
    
    // Team leads can see their team members
    if (currentUser.role === 'TEAM_LEAD' && currentUser.teamId === targetUser.teamId) {
      return true
    }
    
    // Users can see their own data
    if (currentUser.id === targetUser.id) {
      return true
    }
    
    return false
  }

  // Get available roles that user can assign
  static getAssignableRoles(user: User): UserRole[] {
    if (this.hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
      return ['SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'TEAM_LEAD', 'PURCHASING_LEAD', 'INVENTORY_LEAD', 'MEMBER']
    }
    
    if (user.role === 'TEAM_LEAD') {
      return ['PURCHASING_LEAD', 'INVENTORY_LEAD', 'MEMBER']
    }
    
    return []
  }
}

// React hook for permissions
export function usePermissions(user: User | null) {
  if (!user) {
    return {
      hasPermission: () => false,
      canAccessTeam: () => false,
      canEditTeam: () => false,
      canApprovePurchase: () => false,
      canManageUsers: () => false,
      canAssignRoles: () => false,
      canEditInventory: () => false,
      canEditBOM: () => false,
      canViewAnalytics: () => false,
      canExportData: () => false,
      canImportData: () => false,
      getAllowedTeams: () => [],
      canViewUserData: () => false,
      getAssignableRoles: () => []
    }
  }

  return {
    hasPermission: (permission: string) => PermissionManager.hasPermission(user, permission),
    canAccessTeam: (teamId: string) => PermissionManager.canAccessTeam(user, teamId),
    canEditTeam: (teamId: string) => PermissionManager.canEditTeam(user, teamId),
    canApprovePurchase: (teamId?: string) => PermissionManager.canApprovePurchase(user, teamId),
    canManageUsers: () => PermissionManager.canManageUsers(user),
    canAssignRoles: (targetUser?: User) => PermissionManager.canAssignRoles(user, targetUser),
    canEditInventory: (teamId?: string) => PermissionManager.canEditInventory(user, teamId),
    canEditBOM: (teamId?: string) => PermissionManager.canEditBOM(user, teamId),
    canViewAnalytics: () => PermissionManager.canViewAnalytics(user),
    canExportData: () => PermissionManager.canExportData(user),
    canImportData: () => PermissionManager.canImportData(user),
    getAllowedTeams: (allTeams: string[]) => PermissionManager.getAllowedTeams(user, allTeams),
    canViewUserData: (targetUser: User) => PermissionManager.canViewUserData(user, targetUser),
    getAssignableRoles: () => PermissionManager.getAssignableRoles(user)
  }
}
