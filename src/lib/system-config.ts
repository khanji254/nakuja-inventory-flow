// System Configuration - Editable Categories and Locations
export const SystemConfig = {
  // Inventory Categories - can be modified by administrators
  categories: [
    'Electronics',
    'Mechanical',
    'Software',
    'Testing Equipment',
    'Materials',
    'Tools',
    'Safety Equipment',
    'Documentation',
    'Consumables',
    'General'
  ],

  // Storage Locations - can be modified by administrators
  storageLocations: [
    'Store A',
    'Store B', 
    'Store C',
    'Warehouse',
    'Lab Storage',
    'Office',
    'External Storage',
    'Workshop',
    'Clean Room',
    'Archive'
  ],

  // Teams - can be modified by administrators
  teams: [
    'Avionics',
    'Mechanical',
    'Software',
    'Testing',
    'Telemetry',
    'Parachute',
    'Recovery',
    'General'
  ],

  // Priority Levels
  priorities: [
    'urgent',
    'important',
    'normal',
    'low'
  ],

  // Status Options for various entities
  status: {
    purchaseRequest: [
      'pending',
      'approved',
      'rejected',
      'ordered',
      'completed'
    ],
    purchaseList: [
      'draft',
      'submitted',
      'approved',
      'ordered',
      'completed'
    ],
    bom: [
      'draft',
      'active',
      'completed',
      'archived'
    ]
  },

  // System Defaults
  defaults: {
    currency: 'KSh',
    reorderPointMultiplier: 0.2, // 20% of quantity
    minStockMultiplier: 0.1,     // 10% of quantity
    autoSyncInterval: 30000,     // 30 seconds
    defaultLocation: 'Store A',
    defaultCategory: 'General',
    defaultTeam: 'Avionics'
  },

  // Notification Settings
  notifications: {
    lowStockThreshold: 10,
    criticalStockThreshold: 0,
    maxNotificationsDisplay: 5
  }
};

// Configuration Management Functions
export class ConfigManager {
  /**
   * Add a new category to the system
   */
  static addCategory(category: string): void {
    if (!SystemConfig.categories.includes(category)) {
      SystemConfig.categories.push(category);
      this.saveConfig();
    }
  }

  /**
   * Remove a category from the system
   */
  static removeCategory(category: string): void {
    const index = SystemConfig.categories.indexOf(category);
    if (index > -1) {
      SystemConfig.categories.splice(index, 1);
      this.saveConfig();
    }
  }

  /**
   * Add a new storage location to the system
   */
  static addStorageLocation(location: string): void {
    if (!SystemConfig.storageLocations.includes(location)) {
      SystemConfig.storageLocations.push(location);
      this.saveConfig();
    }
  }

  /**
   * Remove a storage location from the system
   */
  static removeStorageLocation(location: string): void {
    const index = SystemConfig.storageLocations.indexOf(location);
    if (index > -1) {
      SystemConfig.storageLocations.splice(index, 1);
      this.saveConfig();
    }
  }

  /**
   * Add a new team to the system
   */
  static addTeam(team: string): void {
    if (!SystemConfig.teams.includes(team)) {
      SystemConfig.teams.push(team);
      this.saveConfig();
    }
  }

  /**
   * Remove a team from the system
   */
  static removeTeam(team: string): void {
    const index = SystemConfig.teams.indexOf(team);
    if (index > -1) {
      SystemConfig.teams.splice(index, 1);
      this.saveConfig();
    }
  }

  /**
   * Update system defaults
   */
  static updateDefaults(newDefaults: Partial<typeof SystemConfig.defaults>): void {
    SystemConfig.defaults = { ...SystemConfig.defaults, ...newDefaults };
    this.saveConfig();
  }

  /**
   * Save configuration to localStorage
   */
  private static saveConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('systemConfig', JSON.stringify(SystemConfig));
    }
  }

  /**
   * Load configuration from localStorage
   */
  static loadConfig(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('systemConfig');
      if (saved) {
        try {
          const savedConfig = JSON.parse(saved);
          Object.assign(SystemConfig, savedConfig);
        } catch (error) {
          console.warn('Failed to load system configuration:', error);
        }
      }
    }
  }

  /**
   * Reset configuration to defaults
   */
  static resetConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('systemConfig');
    }
    // Reload the page to reset to initial values
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  /**
   * Export configuration as JSON
   */
  static exportConfig(): string {
    return JSON.stringify(SystemConfig, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static importConfig(configJson: string): boolean {
    try {
      const imported = JSON.parse(configJson);
      Object.assign(SystemConfig, imported);
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }
}

// Initialize configuration on import
ConfigManager.loadConfig();
