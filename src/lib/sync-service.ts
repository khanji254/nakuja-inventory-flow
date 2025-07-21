import { localStorageService } from './storage-service';
import { InventoryItem, PurchaseRequest, BillOfMaterials, PurchaseList } from '@/types';

// Centralized data synchronization service
class SyncService {
  private listeners: Map<string, Set<() => void>> = new Map();

  // Subscribe to data changes
  subscribe(key: string, callback: () => void) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  // Notify listeners of data changes
  private notify(key: string) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  // Move completed purchase request to pending inventory
  async moveToPendingInventory(purchaseRequest: PurchaseRequest): Promise<void> {
    if (purchaseRequest.status !== 'completed') {
      throw new Error('Only completed purchase requests can be moved to pending inventory');
    }

    // Get current pending inventory items
    const pendingItems = localStorageService.getItem<InventoryItem[]>('pending-inventory') || [];
    
    // Create inventory item from purchase request
    const newInventoryItem: InventoryItem = {
      id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: purchaseRequest.itemName,
      description: purchaseRequest.description || '',
      category: this.getCategoryFromPurchaseRequest(purchaseRequest),
      vendor: purchaseRequest.vendor,
      unitPrice: purchaseRequest.unitPrice,
      currentStock: 0, // Will be set when moved to main inventory
      quantity: purchaseRequest.quantity,
      reorderPoint: Math.ceil(purchaseRequest.quantity * 0.2), // 20% of quantity as default
      minStock: Math.ceil(purchaseRequest.quantity * 0.1), // 10% of quantity as default
      lastUpdated: new Date(),
      updatedBy: 'System - From Purchase Request',
      priority: this.mapUrgencyToPriority(purchaseRequest.urgency),
      eisenhowerQuadrant: purchaseRequest.eisenhowerQuadrant,
      isPending: true
    };

    // Add to pending inventory
    pendingItems.push(newInventoryItem);
    localStorageService.setItem('pending-inventory', pendingItems);

    // Update purchase request to mark as processed
    const purchaseRequests = localStorageService.getItem<PurchaseRequest[]>('purchaseRequests') || [];
    const updatedRequests = purchaseRequests.map(req => 
      req.id === purchaseRequest.id 
        ? { ...req, notes: (req.notes || '') + '\n[Moved to pending inventory]', movedToPending: true }
        : req
    );
    localStorageService.setItem('purchaseRequests', updatedRequests);

    // Notify listeners
    this.notify('pending-inventory');
    this.notify('purchase-requests');
  }

  // Move pending inventory item to main inventory
  async movePendingToInventory(pendingItem: InventoryItem, actualQuantity: number): Promise<void> {
    // Get current inventories
    const pendingItems = localStorageService.getItem<InventoryItem[]>('pending-inventory') || [];
    const inventory = localStorageService.getItem<InventoryItem[]>('inventory') || [];

    // Check if item already exists in inventory
    const existingItemIndex = inventory.findIndex(item => 
      item.name.toLowerCase() === pendingItem.name.toLowerCase() &&
      item.vendor === pendingItem.vendor
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      inventory[existingItemIndex] = {
        ...inventory[existingItemIndex],
        currentStock: inventory[existingItemIndex].currentStock + actualQuantity,
        quantity: inventory[existingItemIndex].quantity + actualQuantity,
        unitPrice: pendingItem.unitPrice, // Update with latest price
        lastUpdated: new Date(),
        updatedBy: 'System - From Pending Inventory'
      };
    } else {
      // Create new inventory item
      const newInventoryItem: InventoryItem = {
        ...pendingItem,
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        currentStock: actualQuantity,
        quantity: actualQuantity,
        lastUpdated: new Date(),
        updatedBy: 'System - From Pending Inventory',
        isPending: false
      };
      inventory.push(newInventoryItem);
    }

    // Remove from pending
    const updatedPendingItems = pendingItems.filter(item => item.id !== pendingItem.id);

    // Save updates
    localStorageService.setItem('inventory', inventory);
    localStorageService.setItem('pending-inventory', updatedPendingItems);

    // Notify listeners
    this.notify('inventory');
    this.notify('pending-inventory');
  }

  // Get pending inventory items
  getPendingInventoryItems(): InventoryItem[] {
    return localStorageService.getItem<InventoryItem[]>('pending-inventory') || [];
  }

  // Sync BOM with inventory
  async syncBOMWithInventory(bomId: string): Promise<void> {
    const boms = localStorageService.getItem<BillOfMaterials[]>('bom-data') || [];
    const inventory = localStorageService.getItem<InventoryItem[]>('inventory') || [];

    const updatedBOMs = boms.map(bom => {
      if (bom.id !== bomId) return bom;

      const updatedItems = bom.items?.map(bomItem => {
        const inventoryItem = inventory.find(inv => 
          inv.name.toLowerCase() === bomItem.itemName.toLowerCase() ||
          inv.partNumber === bomItem.partNumber
        );

        return {
          ...bomItem,
          inventoryItemId: inventoryItem?.id,
          availableStock: inventoryItem?.currentStock || 0,
          shortfall: Math.max(0, bomItem.requiredQuantity - (inventoryItem?.currentStock || 0))
        };
      });

      return {
        ...bom,
        items: updatedItems,
        lastUpdated: new Date()
      };
    });

    localStorageService.setItem('bom-data', updatedBOMs);
    this.notify('bom-data');
  }

  // Helper methods
  private getCategoryFromPurchaseRequest(request: PurchaseRequest): string {
    // Simple category mapping based on item name keywords
    const name = request.itemName.toLowerCase();
    if (name.includes('resistor') || name.includes('capacitor') || name.includes('sensor') || name.includes('circuit')) {
      return 'Electronics';
    }
    if (name.includes('screw') || name.includes('bolt') || name.includes('nut') || name.includes('washer')) {
      return 'Fasteners';
    }
    if (name.includes('fiber') || name.includes('composite') || name.includes('material') || name.includes('sheet')) {
      return 'Materials';
    }
    if (name.includes('parachute') || name.includes('cord') || name.includes('recovery')) {
      return 'Recovery';
    }
    return 'General';
  }

  private mapUrgencyToPriority(urgency: PurchaseRequest['urgency']): InventoryItem['priority'] {
    switch (urgency) {
      case 'critical': return 'urgent';
      case 'high': return 'important';
      case 'medium': return 'normal';
      case 'low': return 'low';
      default: return 'normal';
    }
  }

  // Export data for downloads
  generateInventoryCSV(): string {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    const headers = ['Name', 'Category', 'Vendor', 'Unit Price (KSh)', 'Current Stock', 'Reorder Point', 'Min Stock', 'Total Value (KSh)', 'Last Updated', 'Updated By'];
    
    const rows = inventory.map(item => [
      item.name,
      item.category,
      item.vendor,
      item.unitPrice.toFixed(2),
      item.currentStock.toString(),
      item.reorderPoint.toString(),
      (item.minStock || 0).toString(),
      (item.unitPrice * item.currentStock).toFixed(2),
      item.lastUpdated.toLocaleDateString(),
      item.updatedBy
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  generateNewlyPurchasedCSV(): string {
    const pendingItems = this.getPendingInventoryItems();
    const headers = ['Item Name', 'Category', 'Vendor', 'Unit Price (KSh)', 'Quantity Ordered', 'Total Cost (KSh)', 'Order Date'];
    
    const rows = pendingItems.map(item => [
      item.name,
      item.category,
      item.vendor,
      item.unitPrice.toFixed(2),
      item.quantity.toString(),
      (item.unitPrice * item.quantity).toFixed(2),
      item.lastUpdated.toLocaleDateString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  generateBOMRequirementsCSV(teamFilter?: string): string {
    const boms = localStorageService.getItem<BillOfMaterials[]>('bom-data') || [];
    const filteredBOMs = teamFilter ? boms.filter(bom => bom.team === teamFilter) : boms;
    
    const headers = ['Team', 'Item Name', 'Part Number', 'Category', 'Required Quantity', 'Available Stock', 'Shortfall', 'Unit Price (KSh)', 'Total Cost (KSh)', 'Vendor'];
    
    const rows: string[][] = [];
    filteredBOMs.forEach(bom => {
      bom.items?.forEach(item => {
        rows.push([
          bom.team,
          item.itemName,
          item.partNumber || '',
          item.category || '',
          item.requiredQuantity.toString(),
          (item.availableStock || 0).toString(),
          (item.shortfall || 0).toString(),
          item.unitPrice.toFixed(2),
          (item.unitPrice * item.requiredQuantity).toFixed(2),
          item.vendor
        ]);
      });
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  generateReplacementItemsCSV(): string {
    const inventory = localStorageService.getItem<InventoryItem[]>('inventory') || [];
    const replacementItems = inventory.filter(item => 
      item.currentStock <= (item.minStock || 0) ||
      item.currentStock <= item.reorderPoint
    );
    
    const headers = ['Item Name', 'Category', 'Current Stock', 'Min Stock', 'Reorder Point', 'Recommended Order Qty', 'Unit Price (KSh)', 'Total Cost (KSh)', 'Vendor', 'Priority'];
    
    const rows = replacementItems.map(item => {
      const recommendedQty = Math.max(item.reorderPoint * 2, (item.minStock || 0) * 3) - item.currentStock;
      return [
        item.name,
        item.category,
        item.currentStock.toString(),
        (item.minStock || 0).toString(),
        item.reorderPoint.toString(),
        recommendedQty.toString(),
        item.unitPrice.toFixed(2),
        (item.unitPrice * recommendedQty).toFixed(2),
        item.vendor,
        item.priority || 'normal'
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const syncService = new SyncService();