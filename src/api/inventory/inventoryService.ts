import { prisma } from '../../lib/prisma'
import { InventoryItem } from '../../types'

export class InventoryService {
  static async getAllItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      include: {
        createdBy: true,
        updatedBy: true,
        pendingItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      unitPrice: Number(item.unitPrice),
      currentStock: item.currentStock,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      location: item.location,
      partNumber: item.partNumber,
      minStock: item.minStock,
      description: item.description,
      priority: item.priority as InventoryItem['priority'],
      eisenhowerQuadrant: item.eisenhowerQuadrant as InventoryItem['eisenhowerQuadrant'],
      isPending: item.isPending,
      lastUpdated: item.lastUpdated,
      updatedBy: item.updatedBy.name
    }))
  }

  static async createItem(data: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<InventoryItem> {
    // For now, use a default user ID. In a real app, this would come from authentication
    const defaultUserId = 'temp-user-id'
    
    const item = await prisma.inventoryItem.create({
      data: {
        name: data.name,
        category: data.category,
        vendor: data.vendor,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        quantity: data.quantity,
        reorderPoint: data.reorderPoint,
        location: data.location,
        partNumber: data.partNumber,
        minStock: data.minStock,
        description: data.description,
        priority: data.priority as any,
        eisenhowerQuadrant: data.eisenhowerQuadrant as any,
        isPending: data.isPending || false,
        createdById: defaultUserId,
        updatedById: defaultUserId
      },
      include: {
        createdBy: true,
        updatedBy: true
      }
    })

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      unitPrice: Number(item.unitPrice),
      currentStock: item.currentStock,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      location: item.location,
      partNumber: item.partNumber,
      minStock: item.minStock,
      description: item.description,
      priority: item.priority as InventoryItem['priority'],
      eisenhowerQuadrant: item.eisenhowerQuadrant as InventoryItem['eisenhowerQuadrant'],
      isPending: item.isPending,
      lastUpdated: item.lastUpdated,
      updatedBy: item.updatedBy.name
    }
  }

  static async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const defaultUserId = 'temp-user-id'

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.vendor && { vendor: data.vendor }),
        ...(data.unitPrice && { unitPrice: data.unitPrice }),
        ...(data.currentStock !== undefined && { currentStock: data.currentStock }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.reorderPoint !== undefined && { reorderPoint: data.reorderPoint }),
        ...(data.location && { location: data.location }),
        ...(data.partNumber && { partNumber: data.partNumber }),
        ...(data.minStock !== undefined && { minStock: data.minStock }),
        ...(data.description && { description: data.description }),
        ...(data.priority && { priority: data.priority as any }),
        ...(data.eisenhowerQuadrant && { eisenhowerQuadrant: data.eisenhowerQuadrant as any }),
        ...(data.isPending !== undefined && { isPending: data.isPending }),
        updatedById: defaultUserId
      },
      include: {
        createdBy: true,
        updatedBy: true
      }
    })

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      unitPrice: Number(item.unitPrice),
      currentStock: item.currentStock,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      location: item.location,
      partNumber: item.partNumber,
      minStock: item.minStock,
      description: item.description,
      priority: item.priority as InventoryItem['priority'],
      eisenhowerQuadrant: item.eisenhowerQuadrant as InventoryItem['eisenhowerQuadrant'],
      isPending: item.isPending,
      lastUpdated: item.lastUpdated,
      updatedBy: item.updatedBy.name
    }
  }

  static async deleteItem(id: string): Promise<void> {
    await prisma.inventoryItem.delete({
      where: { id }
    })
  }

  static async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await prisma.inventoryItem.findMany({
      where: {
        currentStock: {
          lte: prisma.inventoryItem.fields.reorderPoint
        }
      },
      include: {
        createdBy: true,
        updatedBy: true
      }
    })

    return items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      vendor: item.vendor,
      unitPrice: Number(item.unitPrice),
      currentStock: item.currentStock,
      quantity: item.quantity,
      reorderPoint: item.reorderPoint,
      location: item.location,
      partNumber: item.partNumber,
      minStock: item.minStock,
      description: item.description,
      priority: item.priority as InventoryItem['priority'],
      eisenhowerQuadrant: item.eisenhowerQuadrant as InventoryItem['eisenhowerQuadrant'],
      isPending: item.isPending,
      lastUpdated: item.lastUpdated,
      updatedBy: item.updatedBy.name
    }))
  }
}
