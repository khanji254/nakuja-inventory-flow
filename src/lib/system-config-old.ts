// System Configuration Management
interface SystemConfig {
  categories: string[];
  storageLocations: string[];
  teams: string[];
  userRoles: string[];
  defaultSettings: {
    lowStockThreshold: number;
    currency: string;
    timezone: string;
    emailNotifications: boolean;
    autoBackup: boolean;
    backupFrequency: string;
    notificationChannels: string[];
  };
  workflow: {
    purchaseApprovalFlow: string[];
    inventoryUpdateFlow: string[];
    taskAssignmentFlow: string[];
  };
  integrations: {
    eisenhowerMatrix: boolean;
    teamManagement: boolean;
    vendorManagement: boolean;
    multiUserAccounts: boolean;
  };
}

// Default configuration
export const SystemConfig: SystemConfig = {
  categories: [
    'Electronics',
    'Materials', 
    'Tools',
    'Chemicals',
    'Safety Equipment',
    'Office Supplies',
    'Avionics',
    'Telemetry',
    'Recovery Systems',
    'Propulsion',
    'Structures'
  ],
  storageLocations: [
    'Lab A',
    'Lab B', 
    'Storage Room',
    'Warehouse',
    'Clean Room',
    'Workshop',
    'Archive',
    'Field Equipment',
    'Launch Site'
  ],
  teams: [
    'Recovery',
    'Avionics', 
    'Telemetry',
    'Parachute',
    'Propulsion',
    'Structures',
    'Admin',
    'Management'
  ],
  userRoles: [
    'admin',
    'team-lead',
    'team-member', 
    'viewer',
    'manager',
    'procurement-officer'
  ],
  defaultSettings: {
    lowStockThreshold: 10,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    notificationChannels: ['email', 'in-app', 'dashboard']
  },
  workflow: {
    purchaseApprovalFlow: ['request', 'team-lead-approval', 'procurement-review', 'approved', 'ordered', 'received', 'inventory-update'],
    inventoryUpdateFlow: ['received', 'quality-check', 'catalogued', 'stored', 'available'],
    taskAssignmentFlow: ['created', 'assigned', 'in-progress', 'review', 'completed']
  },
  integrations: {
    eisenhowerMatrix: true,
    teamManagement: true,
    vendorManagement: true,
    multiUserAccounts: true
  }
};
    'Chemicals',
    'Safety Equipment',
    'Office Supplies'
  ],
  locations: [
    'Lab A',
    'Lab B',
    'Storage Room',
    'Warehouse',
    'Clean Room',
    'Workshop'
  ],
  defaultSettings: {
    lowStockThreshold: 10,
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    autoBackup: true
  },
  teams: [
    'Avionics',
    'Telemetry',
    'Parachute',
    'Recovery'
  ],
  userRoles: [
    'admin',
    'team-lead',
    'team-member'
  ]
};

export class ConfigManager {
  private static config: SystemConfig = { ...defaultConfig };

  static getConfig(): SystemConfig {
    // In a real app, this would load from localStorage or API
    const stored = localStorage.getItem('system-config');
    if (stored) {
      try {
        return { ...defaultConfig, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Failed to parse stored config:', error);
      }
    }
    return this.config;
  }

  static updateConfig(updates: Partial<SystemConfig>): void {
    this.config = { ...this.config, ...updates };
    localStorage.setItem('system-config', JSON.stringify(this.config));
  }

  static addCategory(category: string): void {
    const config = this.getConfig();
    if (!config.categories.includes(category)) {
      config.categories.push(category);
      this.updateConfig(config);
    }
  }

  static removeCategory(category: string): void {
    const config = this.getConfig();
    config.categories = config.categories.filter(c => c !== category);
    this.updateConfig(config);
  }

  static addLocation(location: string): void {
    const config = this.getConfig();
    if (!config.locations.includes(location)) {
      config.locations.push(location);
      this.updateConfig(config);
    }
  }

  static removeLocation(location: string): void {
    const config = this.getConfig();
    config.locations = config.locations.filter(l => l !== location);
    this.updateConfig(config);
  }

  static resetToDefaults(): void {
    this.config = { ...defaultConfig };
    localStorage.removeItem('system-config');
  }

  static exportConfig(): string {
    return JSON.stringify(this.getConfig(), null, 2);
  }

  static importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      this.updateConfig(imported);
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }
}