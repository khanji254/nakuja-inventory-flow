// Simple database service that can work with or without Prisma
// This allows the app to work while we set up the full database

import { InventoryItem, PurchaseRequest, Vendor, BillOfMaterials } from '../types'

// Fallback to localStorage if database is not available
class DatabaseService {
  private static isDbAvailable = false

  static async checkConnection(): Promise<boolean> {
    try {
      // Try to import and use Prisma
      const { prisma } = await import('../lib/prisma')
      await prisma.$connect()
      this.isDbAvailable = true
      return true
    } catch (error) {
      console.warn('Database not available, falling back to localStorage:', error)
      this.isDbAvailable = false
      return false
    }
  }

  // Inventory methods
  static async getInventoryItems(): Promise<InventoryItem[]> {
    if (this.isDbAvailable) {
      try {
        const { InventoryService } = await import('../api/inventory/inventoryService')
        return await InventoryService.getAllItems()
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    const data = localStorage.getItem('inventory')
    return data ? JSON.parse(data) : []
  }

  static async saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    if (this.isDbAvailable) {
      try {
        const { InventoryService } = await import('../api/inventory/inventoryService')
        if (item.id) {
          return await InventoryService.updateItem(item.id, item)
        } else {
          return await InventoryService.createItem(item)
        }
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    const items = await this.getInventoryItems()
    if (!item.id) {
      item.id = Date.now().toString()
    }
    
    const existingIndex = items.findIndex(i => i.id === item.id)
    if (existingIndex >= 0) {
      items[existingIndex] = item
    } else {
      items.push(item)
    }
    
    localStorage.setItem('inventory', JSON.stringify(items))
    return item
  }

  static async deleteInventoryItem(id: string): Promise<void> {
    if (this.isDbAvailable) {
      try {
        const { InventoryService } = await import('../api/inventory/inventoryService')
        await InventoryService.deleteItem(id)
        return
      } catch (error) {
        console.error('Database error, falling back to localStorage:', error)
      }
    }
    
    // Fallback to localStorage
    const items = await this.getInventoryItems()
    const filtered = items.filter(item => item.id !== id)
    localStorage.setItem('inventory', JSON.stringify(filtered))
  }

  // Purchase requests methods
  static async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    if (this.isDbAvailable) {
      // TODO: Implement purchase request service
    }
    
    const data = localStorage.getItem('purchaseRequests')
    return data ? JSON.parse(data) : []
  }

  static async savePurchaseRequest(request: PurchaseRequest): Promise<PurchaseRequest> {
    const requests = await this.getPurchaseRequests()
    if (!request.id) {
      request.id = Date.now().toString()
    }
    
    const existingIndex = requests.findIndex(r => r.id === request.id)
    if (existingIndex >= 0) {
      requests[existingIndex] = request
    } else {
      requests.push(request)
    }
    
    localStorage.setItem('purchaseRequests', JSON.stringify(requests))
    return request
  }

  // Vendors methods
  static async getVendors(): Promise<Vendor[]> {
    if (this.isDbAvailable) {
      // TODO: Implement vendor service
    }
    
    const data = localStorage.getItem('vendors')
    return data ? JSON.parse(data) : []
  }

  static async saveVendor(vendor: Vendor): Promise<Vendor> {
    const vendors = await this.getVendors()
    if (!vendor.id) {
      vendor.id = Date.now().toString()
    }
    
    const existingIndex = vendors.findIndex(v => v.id === vendor.id)
    if (existingIndex >= 0) {
      vendors[existingIndex] = vendor
    } else {
      vendors.push(vendor)
    }
    
    localStorage.setItem('vendors', JSON.stringify(vendors))
    return vendor
  }

  // BOM methods
  static async getBOMs(): Promise<BillOfMaterials[]> {
    if (this.isDbAvailable) {
      // TODO: Implement BOM service
    }
    
    const data = localStorage.getItem('bom')
    return data ? JSON.parse(data) : []
  }

  static async saveBOM(bom: BillOfMaterials): Promise<BillOfMaterials> {
    const boms = await this.getBOMs()
    if (!bom.id) {
      bom.id = Date.now().toString()
    }
    
    const existingIndex = boms.findIndex(b => b.id === bom.id)
    if (existingIndex >= 0) {
      boms[existingIndex] = bom
    } else {
      boms.push(bom)
    }
    
    localStorage.setItem('bom', JSON.stringify(boms))
    return bom
  }
}

// Initialize the service
DatabaseService.checkConnection()

export { DatabaseService }
