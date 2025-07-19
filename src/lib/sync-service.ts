import { localStorageService } from './storage-service';
import { PurchaseRequest, InventoryItem, PurchaseList, BillOfMaterials } from '@/types';
import { SystemConfig } from './system-config';

export class SyncService {
  /**
   * Synchronizes completed purchase requests with inventory
   * This should be called when a purchase request status changes to 'completed'
   */
  static async syncPurchaseToInventory(purchaseRequest: PurchaseRequest): Promise<void> {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventoryItems') || [];
    
    // Check if item already exists in inventory
    const existingItemIndex = inventory.findIndex(item => 
      item.name.toLowerCase() === purchaseRequest.itemName.toLowerCase() &&
      item.vendor === purchaseRequest.vendor
    );

    if (existingItemIndex >= 0) {
      // Update existing item stock
      inventory[existingItemIndex] = {
        ...inventory[existingItemIndex],
        currentStock: inventory[existingItemIndex].currentStock + purchaseRequest.quantity,
        quantity: inventory[existingItemIndex].quantity + purchaseRequest.quantity,
        lastUpdated: new Date(),
        updatedBy: 'Purchase System'
      };
    } else {
      // Create new inventory item
      const newInventoryItem: InventoryItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: purchaseRequest.itemName,
        category: this.inferCategoryFromTeam(purchaseRequest.team),
        vendor: purchaseRequest.vendor,
        unitPrice: purchaseRequest.unitPrice,
        currentStock: purchaseRequest.quantity,
        quantity: purchaseRequest.quantity,
        reorderPoint: Math.max(5, Math.floor(purchaseRequest.quantity * 0.2)), // 20% of initial quantity
        location: 'Store A', // Default location, can be updated later
        partNumber: undefined,
        minStock: Math.max(3, Math.floor(purchaseRequest.quantity * 0.1)), // 10% of initial quantity
        description: purchaseRequest.description || `Purchased from ${purchaseRequest.vendor}`,
        lastUpdated: new Date(),
        updatedBy: 'Purchase System',
        priority: purchaseRequest.urgency === 'critical' ? 'urgent' : 
                 purchaseRequest.urgency === 'high' ? 'important' : 'normal',
        eisenhowerQuadrant: purchaseRequest.eisenhowerQuadrant
      };
      
      inventory.push(newInventoryItem);
    }

    localStorageService.setItem('inventoryItems', inventory);
  }

  /**
   * Synchronizes BOM requirements with inventory availability
   * Returns items that need to be purchased for the BOM
   */
  static async syncBOMWithInventory(bom: BillOfMaterials): Promise<PurchaseRequest[]> {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventoryItems') || [];
    const neededPurchases: PurchaseRequest[] = [];

    // For single item BOMs
    if (!bom.items) {
      const inventoryItem = inventory.find(item => 
        item.name.toLowerCase() === bom.itemName.toLowerCase()
      );

      if (!inventoryItem || inventoryItem.currentStock < bom.requiredQuantity) {
        const shortfall = bom.requiredQuantity - (inventoryItem?.currentStock || 0);
        neededPurchases.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          itemName: bom.itemName,
          title: `BOM Requirement: ${bom.name || bom.itemName}`,
          description: `Required for ${bom.name || bom.itemName} BOM`,
          type: 'BOM',
          unitPrice: bom.unitPrice,
          quantity: shortfall,
          urgency: 'medium',
          vendor: bom.vendor,
          requestedBy: 'BOM System',
          requestedDate: new Date(),
          status: 'pending',
          team: bom.team,
          notes: `Shortfall for BOM: ${bom.name || bom.itemName}`,
          isLowStockItem: true
        });
      }
    } else {
      // For multi-item BOMs
      bom.items.forEach(bomItem => {
        const inventoryItem = inventory.find(item => 
          item.name.toLowerCase() === bomItem.itemName.toLowerCase()
        );

        if (!inventoryItem || inventoryItem.currentStock < bomItem.requiredQuantity) {
          const shortfall = bomItem.requiredQuantity - (inventoryItem?.currentStock || 0);
          neededPurchases.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            itemName: bomItem.itemName,
            title: `BOM Requirement: ${bomItem.itemName}`,
            description: bomItem.description || `Required for ${bom.name || bom.itemName} BOM`,
            type: 'BOM',
            unitPrice: bomItem.unitPrice,
            quantity: shortfall,
            urgency: 'medium',
            vendor: bomItem.vendor,
            requestedBy: 'BOM System',
            requestedDate: new Date(),
            status: 'pending',
            team: bomItem.team,
            notes: `Shortfall for BOM: ${bom.name || bom.itemName}`,
            isLowStockItem: true
          });
        }
      });
    }

    return neededPurchases;
  }

  /**
   * Updates inventory when items are allocated to a BOM
   */
  static async allocateInventoryToBOM(bom: BillOfMaterials): Promise<void> {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventoryItems') || [];

    // For single item BOMs
    if (!bom.items) {
      const itemIndex = inventory.findIndex(item => 
        item.name.toLowerCase() === bom.itemName.toLowerCase()
      );

      if (itemIndex >= 0 && inventory[itemIndex].currentStock >= bom.requiredQuantity) {
        inventory[itemIndex].currentStock -= bom.requiredQuantity;
        inventory[itemIndex].lastUpdated = new Date();
        inventory[itemIndex].updatedBy = 'BOM System';
      }
    } else {
      // For multi-item BOMs
      bom.items.forEach(bomItem => {
        const itemIndex = inventory.findIndex(item => 
          item.name.toLowerCase() === bomItem.itemName.toLowerCase()
        );

        if (itemIndex >= 0 && inventory[itemIndex].currentStock >= bomItem.requiredQuantity) {
          inventory[itemIndex].currentStock -= bomItem.requiredQuantity;
          inventory[itemIndex].lastUpdated = new Date();
          inventory[itemIndex].updatedBy = 'BOM System';
        }
      });
    }

    localStorageService.setItem('inventoryItems', inventory);
  }

  /**
   * Generates purchase requests for low stock items
   */
  static async generateLowStockPurchaseRequests(): Promise<PurchaseRequest[]> {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventoryItems') || [];
    const lowStockItems = inventory.filter(item => 
      item.currentStock <= (item.minStock || item.reorderPoint || 10)
    );

    return lowStockItems.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      itemName: item.name,
      title: `Low Stock Reorder: ${item.name}`,
      description: `Automatic reorder for low stock item`,
      type: 'Reorder',
      unitPrice: item.unitPrice,
      quantity: Math.max(item.reorderPoint * 2, 10), // Order double the reorder point
      urgency: item.currentStock === 0 ? 'critical' : 'high',
      vendor: item.vendor,
      requestedBy: 'Auto System',
      requestedDate: new Date(),
      status: 'pending',
      team: this.inferTeamFromCategory(item.category),
      notes: `Auto-generated for low stock. Current: ${item.currentStock}, Min: ${item.minStock || item.reorderPoint}`,
      isLowStockItem: true,
      eisenhowerQuadrant: item.currentStock === 0 ? 'important-urgent' : 'important-not-urgent'
    }));
  }

  /**
   * Synchronizes purchase lists with vendor information
   */
  static async syncPurchaseListsWithVendors(): Promise<void> {
    const purchaseLists = localStorageService.getItem<PurchaseList[]>('purchaseLists') || [];
    const vendors = localStorageService.getItem<any[]>('vendors') || [];

    // Update lists to ensure vendor information is current
    const updatedLists = purchaseLists.map(list => ({
      ...list,
      vendors: list.vendors.filter(vendorId => 
        vendors.some((v: any) => v.id === vendorId)
      )
    }));

    localStorageService.setItem('purchaseLists', updatedLists);
  }

  /**
   * Helper method to infer category from team
   */
  private static inferCategoryFromTeam(team: string): string {
    switch (team.toLowerCase()) {
      case 'avionics':
        return 'Electronics';
      case 'mechanical':
        return 'Mechanical';
      case 'software':
        return 'Software';
      case 'testing':
        return 'Testing Equipment';
      case 'telemetry':
        return 'Electronics';
      case 'parachute':
        return 'Materials';
      case 'recovery':
        return 'Materials';
      default:
        return 'General';
    }
  }

  /**
   * Helper method to infer team from category
   */
  private static inferTeamFromCategory(category: string): any {
    switch (category.toLowerCase()) {
      case 'electronics':
        return 'Avionics';
      case 'mechanical':
        return 'Mechanical';
      case 'software':
        return 'Software';
      case 'testing equipment':
        return 'Testing';
      case 'materials':
        return 'Mechanical';
      default:
        return 'Avionics';
    }
  }

  /**
   * Initialize automatic synchronization with periodic intervals
   */
  static initializeAutoSync(): void {
    // Run initial sync
    this.fullSync().catch(console.error);
    
    // Set up periodic sync
    setInterval(() => {
      this.fullSync().catch(console.error);
    }, SystemConfig.defaults.autoSyncInterval);
    
    console.log('Automatic synchronization initialized');
  }

  /**
   * Full system synchronization - call this periodically
   */
  static async fullSync(): Promise<void> {
    // Sync purchase lists with vendors
    await this.syncPurchaseListsWithVendors();

    // Generate low stock purchase requests
    const lowStockRequests = await this.generateLowStockPurchaseRequests();
    
    if (lowStockRequests.length > 0) {
      const existingRequests = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests') || [];
      
      // Only add requests that don't already exist
      const newRequests = lowStockRequests.filter(newReq => 
        !existingRequests.some(existing => 
          existing.itemName === newReq.itemName && 
          existing.vendor === newReq.vendor &&
          existing.status === 'pending' &&
          existing.isLowStockItem
        )
      );

      if (newRequests.length > 0) {
        localStorageService.setItem('purchaseRequests', [...existingRequests, ...newRequests]);
      }
    }
  }
}

// Auto-sync every 30 seconds when the app is active
if (typeof window !== 'undefined') {
  setInterval(() => {
    SyncService.fullSync();
  }, 30000);
}
