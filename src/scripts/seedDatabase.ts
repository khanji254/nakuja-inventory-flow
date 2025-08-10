import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { ROLE_PERMISSIONS } from '../lib/permissions'

const prisma = new PrismaClient()

function genPassword(length = 16) {
  const raw = crypto.randomBytes(length * 2).toString('base64')
  const alnum = raw.replace(/[^A-Za-z0-9]/g, '')
  return alnum.slice(0, length)
}

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Create default teams
    await Promise.all([
      prisma.team.upsert({
        where: { id: 'recovery' },
        update: {},
        create: {
          id: 'recovery',
          name: 'Recovery Team',
          description: 'Rocket recovery and parachute systems'
        }
      }),
      prisma.team.upsert({
        where: { id: 'avionics' },
        update: {},
        create: {
          id: 'avionics',
          name: 'Avionics Team',
          description: 'Flight computer and electronic systems'
        }
      }),
      prisma.team.upsert({
        where: { id: 'telemetry' },
        update: {},
        create: {
          id: 'telemetry',
          name: 'Telemetry Team',
          description: 'Data transmission and ground station'
        }
      }),
      prisma.team.upsert({
        where: { id: 'parachute' },
        update: {},
        create: {
          id: 'parachute',
          name: 'Parachute Team',
          description: 'Parachute design and deployment systems'
        }
      })
    ])

    console.log('✅ Created default teams')

    // Create administrator account
    const adminPlain = genPassword(18)
    const adminPassword = await bcrypt.hash(adminPlain, 12)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@nakuja.org' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@nakuja.org',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
        isActive: true
      }
    })

    console.log('✅ Created administrator account')

    // Create 4 admin accounts
    const adminAccounts = [
      { name: 'John Smith', email: 'john.admin@nakuja.org', role: 'ADMIN' as const, teamId: 'recovery' },
      { name: 'Sarah Johnson', email: 'sarah.admin@nakuja.org', role: 'ADMIN' as const, teamId: 'avionics' },
      { name: 'Mike Wilson', email: 'mike.admin@nakuja.org', role: 'ADMIN' as const, teamId: 'telemetry' },
      { name: 'Lisa Brown', email: 'lisa.admin@nakuja.org', role: 'ADMIN' as const, teamId: 'parachute' }
    ]

    const generatedPasswords: Record<string, string> = {
      'admin@nakuja.org': adminPlain
    }

    for (const account of adminAccounts) {
      const plain = genPassword(16)
      generatedPasswords[account.email] = plain
      const hashedPassword = await bcrypt.hash(plain, 12)
      await prisma.user.upsert({
        where: { email: account.email },
        update: {},
        create: {
          ...account,
          password: hashedPassword,
          permissions: ROLE_PERMISSIONS[account.role],
          isActive: true
        }
      })
    }

    console.log('✅ Created 4 admin accounts')

    // Create team leads
    const teamLeads = [
      { name: 'Alex Recovery', email: 'alex.lead@nakuja.org', role: 'TEAM_LEAD' as const, teamId: 'recovery' },
      { name: 'Emma Avionics', email: 'emma.lead@nakuja.org', role: 'TEAM_LEAD' as const, teamId: 'avionics' }
    ]

    for (const lead of teamLeads) {
      const plain = genPassword(16)
      generatedPasswords[lead.email] = plain
      const hashedPassword = await bcrypt.hash(plain, 12)
      await prisma.user.upsert({
        where: { email: lead.email },
        update: {},
        create: {
          ...lead,
          password: hashedPassword,
          permissions: ROLE_PERMISSIONS[lead.role],
          isActive: true
        }
      })
    }

    console.log('✅ Created team leads')

    // Specialized leads
    const specializedLeads = [
      { name: 'David Purchase', email: 'david.purchasing@nakuja.org', role: 'PURCHASING_LEAD' as const, teamId: 'recovery' },
      { name: 'Maria Inventory', email: 'maria.inventory@nakuja.org', role: 'INVENTORY_LEAD' as const, teamId: 'avionics' },
      { name: 'Tom Supervisor', email: 'tom.supervisor@nakuja.org', role: 'SUPERVISOR' as const, teamId: 'telemetry' }
    ]

    for (const lead of specializedLeads) {
      const plain = genPassword(16)
      generatedPasswords[lead.email] = plain
      const hashedPassword = await bcrypt.hash(plain, 12)
      await prisma.user.upsert({
        where: { email: lead.email },
        update: {},
        create: {
          ...lead,
          password: hashedPassword,
          permissions: ROLE_PERMISSIONS[lead.role],
          isActive: true
        }
      })
    }

    console.log('✅ Created specialized leads')

    // Demo members
    const members = [
      { name: 'Jane Member', email: 'jane.member@nakuja.org', role: 'MEMBER' as const, teamId: 'recovery' },
      { name: 'Bob Builder', email: 'bob.member@nakuja.org', role: 'MEMBER' as const, teamId: 'avionics' }
    ]

    for (const member of members) {
      const plain = genPassword(14)
      generatedPasswords[member.email] = plain
      const hashedPassword = await bcrypt.hash(plain, 12)
      await prisma.user.upsert({
        where: { email: member.email },
        update: {},
        create: {
          ...member,
          password: hashedPassword,
          permissions: ROLE_PERMISSIONS[member.role],
          isActive: true
        }
      })
    }

    console.log('✅ Created demo members')

    // Assign team leads
    await prisma.team.update({
      where: { id: 'recovery' },
      data: {
        teamLeadId: (await prisma.user.findUnique({ where: { email: 'alex.lead@nakuja.org' } }))?.id || undefined
      }
    })

    await prisma.team.update({
      where: { id: 'avionics' },
      data: {
        teamLeadId: (await prisma.user.findUnique({ where: { email: 'emma.lead@nakuja.org' } }))?.id || undefined
      }
    })

    console.log('✅ Assigned team leads')

    // Create sample inventory items (mapped to current schema requirements)
    const inventoryItems = [
      {
        name: 'Flight Computer Board',
        description: 'Main flight computer for rocket guidance',
        category: 'Electronics',
        unitPrice: new Prisma.Decimal(150.0),
        currentStock: 5,
        quantity: 5,
        reorderPoint: 2,
        vendor: 'TechCorp',
        location: 'Storage Room A',
        teamId: 'avionics'
      },
      {
        name: 'Parachute Fabric',
        description: 'High-strength nylon fabric for main parachute',
        category: 'Materials',
        unitPrice: new Prisma.Decimal(75.0),
        currentStock: 10,
        quantity: 10,
        reorderPoint: 3,
        vendor: 'Parachute Supplies Inc',
        location: 'Storage Room B',
        teamId: 'recovery'
      },
      {
        name: 'Telemetry Module',
        description: 'Radio transmitter for real-time data',
        category: 'Electronics',
        unitPrice: new Prisma.Decimal(200.0),
        currentStock: 3,
        quantity: 3,
        reorderPoint: 1,
        vendor: 'RadioTech',
        location: 'Electronics Lab',
        teamId: 'telemetry'
      }
    ]

    for (const item of inventoryItems) {
      await prisma.inventoryItem.create({
        data: {
          ...item,
          createdById: admin.id,
          updatedById: admin.id
        }
      })
    }

    console.log('✅ Created sample inventory items')

    console.log('\n🎉 Database seeded successfully!\n')

    console.log('📋 Generated Account Credentials:')
    for (const [email, pwd] of Object.entries(generatedPasswords)) {
      console.log(`  - ${email}  |  ${pwd}`)
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
