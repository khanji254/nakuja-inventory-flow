export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  unitPrice: number;
  currentStock: number;
  quantity: number;
  reorderPoint: number;
  location?: string;
  partNumber?: string;
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
  title?: string;
  description?: string;
  type?: string;
  unitPrice: number;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  vendor: string;
  requestedBy: string;
  requestedDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'completed';
  approvedBy?: string;
  approvedDate?: Date;
  notes?: string;
  team: Team;
  eisenhowerQuadrant?: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
  listId?: string; // Reference to purchase list
  orderNumber?: string;
  deliveryDate?: Date;
  isLowStockItem?: boolean;
}

export interface PurchaseList {
  id: string;
  title: string;
  description?: string;
  team: Team;
  category: string;
  color: string;
  vendors: string[]; // Changed to array for multiple vendors
  items: PurchaseListItem[];
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'completed';
  totalAmount: number;
  createdBy: string;
  createdDate: Date;
  submittedDate?: Date;
  approvedDate?: Date;
  orderDate?: Date;
  completedDate?: Date;
  notes?: string;
}

export interface PurchaseListItem {
  id: string;
  requestId?: string; // Reference to original purchase request
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  category: string;
  location?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  status: 'pending' | 'ordered' | 'delivered';
  team: Team;
}

export interface BOMItem {
  id: string;
  itemName: string;
  description?: string;
  partNumber?: string;
  category?: string;
  requiredQuantity: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  team: Team;
  inventoryItemId?: string;
  availableStock?: number;
  shortfall?: number;
  notes?: string;
}

export interface BillOfMaterials {
  id: string;
  itemName: string;
  name?: string;
  description?: string;
  partNumber?: string;
  category?: string;
  requiredQuantity: number;
  unitPrice: number;
  vendor: string;
  team: Team;
  items?: BOMItem[];
  totalCost?: number;
  createdBy?: string;
  createdDate: Date;
  lastUpdated: Date;
  status?: 'draft' | 'active' | 'completed';
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: Team;
  avatar?: string;
  phone?: string;
  department?: string;
  joinDate: Date;
  bio?: string;
  skills?: string[];
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  lastLogin?: Date;
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: Date;
  relatedItemId?: string;
  relatedItemType?: 'inventory' | 'purchase-request' | 'bom';
  actionUrl?: string;
}

export type PaymentMethod = 
  | 'paybill'
  | 'paybill-with-store'
  | 'till-number'
  | 'pochi-la-biashara'
  | 'send-money'
  | 'bank-transfer'
  | 'cash'
  | 'credit-card';

export interface PaymentInfo {
  method: PaymentMethod;
  details: string; // Store number, till number, phone number, account details, etc.
  accountName?: string;
  additionalInfo?: string;
}

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone: string;
  alternativePhone?: string;
  location: {
    address: string;
    city: string;
    region?: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  paymentMethods: PaymentInfo[];
  category?: string; // Electronics, Materials, Services, etc.
  rating?: number; // 1-5 star rating
  notes?: string;
  website?: string;
  registrationNumber?: string;
  taxNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}