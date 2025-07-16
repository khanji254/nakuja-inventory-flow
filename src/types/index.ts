export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  unitPrice: number;
  currentStock: number;
  minStock?: number;
  description?: string;
  lastUpdated: Date;
  updatedBy: string;
  priority?: 'urgent' | 'important' | 'normal' | 'low';
  eisenhowerQuadrant?: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
}

export interface PurchaseRequest {
  id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  vendor: string;
  requestedBy: string;
  requestedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  team: Team;
  eisenhowerQuadrant?: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
}

export interface BOMItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  inventoryItemId?: string;
  availableStock?: number;
  shortfall?: number;
  notes?: string;
}

export interface BillOfMaterials {
  id: string;
  name: string;
  team: Team;
  items: BOMItem[];
  totalCost: number;
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  status: 'draft' | 'active' | 'completed';
}

export type Team = 'Avionics' | 'Telemetry' | 'Parachute' | 'Recovery';

export type UserRole = 'admin' | 'team-lead' | 'team-member';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: Team;
  permissions: string[];
}

export interface DashboardData {
  totalInventoryValue: number;
  lowStockItems: number;
  pendingRequests: number;
  activeBOMs: number;
  budgetUtilization: number;
  stockLevels: { [key: string]: number };
}

export interface EisenhowerMatrix {
  importantUrgent: string[];
  importantNotUrgent: string[];
  notImportantUrgent: string[];
  notImportantNotUrgent: string[];
}