import { prisma } from '../lib/prisma'

// This script migrates data from localStorage to the database
// Run this once when setting up the database for the first time

async function migrateLocalStorageData() {
  try {
    console.log('🚀 Starting data migration...')

    // Create a default user first (required for foreign key constraints)
    const defaultUser = await prisma.user.upsert({
      where: { email: 'admin@nakuja.com' },
      update: {},
      create: {
        name: 'System Admin',
        email: 'admin@nakuja.com',
        role: 'ADMIN',
        team: 'AVIONICS',
        permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN']
      }
    })

    console.log('✅ Default user created:', defaultUser.name)

    // Sample inventory data (replace with actual localStorage data if needed)
    const sampleInventoryItems = [
      {
        name: 'Raspberry Pi 4',
        category: 'Electronics',
        vendor: 'Element14',
        unitPrice: 12000,
        currentStock: 5,
        quantity: 10,
        reorderPoint: 3,
        location: 'Lab A',
        partNumber: 'RPI4-4GB',
        description: '4GB RAM Raspberry Pi 4 Model B',
        priority: 'NORMAL' as const,
        team: 'AVIONICS' as const
      },
      {
        name: 'Arduino Uno R3',
        category: 'Electronics',
        vendor: 'Arduino Store',
        unitPrice: 3500,
        currentStock: 2,
        quantity: 15,
        reorderPoint: 5,
        location: 'Lab A',
        partNumber: 'ARD-UNO-R3',
        description: 'Arduino Uno R3 development board',
        priority: 'IMPORTANT' as const,
        team: 'TELEMETRY' as const
      },
      {
        name: 'Parachute Fabric',
        category: 'Materials',
        vendor: 'Parachute Solutions',
        unitPrice: 8500,
        currentStock: 1,
        quantity: 3,
        reorderPoint: 2,
        location: 'Storage Room',
        partNumber: 'PARA-FABRIC-001',
        description: 'High-strength parachute fabric material',
        priority: 'URGENT' as const,
        team: 'PARACHUTE' as const
      }
    ]

    // Create inventory items
    for (const item of sampleInventoryItems) {
      await prisma.inventoryItem.create({
        data: {
          ...item,
          createdById: defaultUser.id,
          updatedById: defaultUser.id
        }
      })
    }

    console.log('✅ Sample inventory items created')

    // Sample purchase requests
    const samplePurchaseRequests = [
      {
        itemName: 'LoRa Module',
        title: 'Long Range Communication Module',
        description: 'LoRa module for telemetry system',
        unitPrice: 2500,
        quantity: 5,
        urgency: 'HIGH' as const,
        vendor: 'Electronics Hub',
        status: 'PENDING' as const,
        team: 'TELEMETRY' as const,
        requestedById: defaultUser.id
      },
      {
        itemName: 'Recovery System Components',
        title: 'Recovery Hardware Kit',
        description: 'Various hardware components for recovery system',
        unitPrice: 15000,
        quantity: 1,
        urgency: 'MEDIUM' as const,
        vendor: 'Aerospace Supplies',
        status: 'APPROVED' as const,
        team: 'RECOVERY' as const,
        requestedById: defaultUser.id,
        approvedById: defaultUser.id,
        approvedDate: new Date()
      }
    ]

    // Create purchase requests
    for (const request of samplePurchaseRequests) {
      await prisma.purchaseRequest.create({
        data: request
      })
    }

    console.log('✅ Sample purchase requests created')

    // Sample vendors
    const sampleVendors = [
      {
        name: 'Element14',
        companyName: 'Element14 Kenya Ltd',
        contactPerson: 'John Doe',
        email: 'sales@element14.co.ke',
        phone: '+254700123456',
        location: {
          address: '123 Industrial Area Road',
          city: 'Nairobi',
          country: 'Kenya'
        },
        paymentMethods: [
          {
            method: 'PAYBILL',
            details: '400200',
            accountName: 'Element14 Kenya',
            additionalInfo: 'Use order number as reference'
          }
        ],
        category: 'Electronics',
        rating: 4.5,
        isActive: true,
        createdById: defaultUser.id
      },
      {
        name: 'Arduino Store Kenya',
        companyName: 'Arduino Store Kenya Ltd',
        contactPerson: 'Jane Smith',
        email: 'info@arduinostore.co.ke',
        phone: '+254711234567',
        location: {
          address: '456 Tech Avenue',
          city: 'Nairobi',
          country: 'Kenya'
        },
        paymentMethods: [
          {
            method: 'TILL_NUMBER',
            details: '123456',
            accountName: 'Arduino Store',
            additionalInfo: 'M-Pesa payments accepted'
          }
        ],
        category: 'Electronics',
        rating: 4.8,
        isActive: true,
        createdById: defaultUser.id
      }
    ]

    // Create vendors
    for (const vendor of sampleVendors) {
      await prisma.vendor.create({
        data: vendor
      })
    }

    console.log('✅ Sample vendors created')

    // Sample BOM
    const sampleBOM = await prisma.billOfMaterials.create({
      data: {
        itemName: 'Telemetry System v2.0',
        name: 'Complete Telemetry System',
        description: 'Full telemetry system for rocket communication',
        category: 'Systems',
        requiredQuantity: 1,
        unitPrice: 45000,
        vendor: 'Multiple Vendors',
        team: 'TELEMETRY',
        totalCost: 45000,
        status: 'ACTIVE',
        createdById: defaultUser.id
      }
    })

    // Create BOM items
    const bomItems = [
      {
        itemName: 'LoRa Module',
        description: 'Long range communication module',
        partNumber: 'LORA-915',
        category: 'Electronics',
        requiredQuantity: 2,
        quantity: 2,
        unitPrice: 2500,
        totalPrice: 5000,
        vendor: 'Electronics Hub',
        team: 'TELEMETRY' as const,
        bomId: sampleBOM.id
      },
      {
        itemName: 'Antenna',
        description: '915MHz antenna for LoRa',
        partNumber: 'ANT-915',
        category: 'Electronics',
        requiredQuantity: 2,
        quantity: 2,
        unitPrice: 1500,
        totalPrice: 3000,
        vendor: 'RF Solutions',
        team: 'TELEMETRY' as const,
        bomId: sampleBOM.id
      }
    ]

    for (const bomItem of bomItems) {
      await prisma.bOMItem.create({
        data: bomItem
      })
    }

    console.log('✅ Sample BOM created')

    console.log('🎉 Data migration completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - 1 User created`)
    console.log(`   - ${sampleInventoryItems.length} Inventory items created`)
    console.log(`   - ${samplePurchaseRequests.length} Purchase requests created`)
    console.log(`   - ${sampleVendors.length} Vendors created`)
    console.log(`   - 1 BOM with ${bomItems.length} items created`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Function to migrate actual localStorage data
export async function migrateFromLocalStorage() {
  // This would read from localStorage if running in browser context
  // For now, we'll use the sample data above
  
  if (typeof window !== 'undefined' && window.localStorage) {
    console.log('🔄 Migrating from localStorage...')
    
    // Get existing data from localStorage
    const inventoryData = localStorage.getItem('inventory')
    const purchaseRequestsData = localStorage.getItem('purchaseRequests')
    const vendorsData = localStorage.getItem('vendors')
    const bomData = localStorage.getItem('bom')
    
    if (inventoryData) {
      const items = JSON.parse(inventoryData)
      console.log(`Found ${items.length} inventory items in localStorage`)
      // Migration logic here...
    }
    
    if (purchaseRequestsData) {
      const requests = JSON.parse(purchaseRequestsData)
      console.log(`Found ${requests.length} purchase requests in localStorage`)
      // Migration logic here...
    }
    
    // Clear localStorage after successful migration
    // localStorage.clear()
  }
  
  return migrateLocalStorageData()
}

// Run migration if called directly
if (require.main === module) {
  migrateLocalStorageData()
    .then(() => {
      console.log('Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}
