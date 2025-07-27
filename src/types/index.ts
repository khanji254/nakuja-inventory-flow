export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  vendor: string;
  unitPrice: number; // Always in KSh
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
  isPending?: boolean; // Indicates if item is in pending state (awaiting confirmation)
}

export interface PurchaseRequest {
  id: string;
  itemName: string;
  title?: string;
  description?: string;
  type?: string;
  unitPrice: number; // Always in KSh
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
  movedToPending?: boolean; // Indicates if moved to pending inventory
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
  unitPrice: number; // Always in KSh
  totalPrice: number; // Always in KSh
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
  unitPrice: number; // Always in KSh
  vendor: string;
  team: Team;
  items?: BOMItem[];
  totalCost?: number; // Always in KSh
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
  totalInventoryValue: number; // Always in KSh
  lowStockItems: number;
  pendingRequests: number;
  activeBOMs: number;
  budgetUtilization: number;
  stockLevels: { [key: string]: number };
  pendingInventoryItems: number;
}

export interface PendingInventoryItem extends InventoryItem {
  originalRequestId?: string;
  expectedQuantity: number;
  actualQuantity?: number;
  receivedDate?: Date;
  qualityCheck?: 'pending' | 'passed' | 'failed';
  notes?: string;
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

// Task Management Types
export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  deadline: Date;
  estimatedHours: number;
  actualHours?: number;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0-100
  category: TaskCategory;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  teamId?: string;
  tags?: string[];
  dependencies?: string[]; // Task IDs this task depends on
  completedAt?: Date;
  notes?: string;
}

export type TaskPriority = 
  | 'important-urgent' 
  | 'important-not-urgent' 
  | 'not-important-urgent' 
  | 'not-important-not-urgent';

export type TaskStatus = 
  | 'not-started'
  | 'in-progress' 
  | 'blocked'
  | 'under-review'
  | 'completed'
  | 'cancelled';

export type TaskCategory = 
  | 'development'
  | 'design'
  | 'testing'
  | 'documentation'
  | 'meeting'
  | 'research'
  | 'maintenance'
  | 'other';

export interface TaskProgress {
  taskId: string;
  userId: string;
  progress: number;
  actualHours?: number;
  status: TaskStatus;
  notes?: string;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}

// Enhanced Matrix Tasks Interface
export interface MatrixTask extends Task {
  // Inherits all Task properties
}

export interface MatrixTasks {
  'important-urgent': MatrixTask[];
  'important-not-urgent': MatrixTask[];
  'not-important-urgent': MatrixTask[];
  'not-important-not-urgent': MatrixTask[];
}

// User Task Dashboard
export interface UserTaskSummary {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  completionRate: number;
  averageTaskTime: number;
  upcomingDeadlines: Task[];
}