import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Create default teams
    const teams = await Promise.all([
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
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nakuja.org' },
      update: {},
      create: {
        name: 'System Administrator',
        email: 'admin@nakuja.org',
        password: adminPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })

    console.log('✅ Created administrator account')

    // Create 4 admin accounts as requested
    const adminAccounts = [
      {
        name: 'John Smith',
        email: 'john.admin@nakuja.org',
        role: 'ADMIN' as const,
        teamId: 'recovery'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.admin@nakuja.org',
        role: 'ADMIN' as const,
        teamId: 'avionics'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.admin@nakuja.org',
        role: 'ADMIN' as const,
        teamId: 'telemetry'
      },
      {
        name: 'Lisa Brown',
        email: 'lisa.admin@nakuja.org',
        role: 'ADMIN' as const,
        teamId: 'parachute'
      }
    ]

    for (const account of adminAccounts) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.upsert({
        where: { email: account.email },
        update: {},
        create: {
          ...account,
          password: hashedPassword,
          isActive: true
        }
      })
    }

    console.log('✅ Created 4 admin accounts')

    // Create team leads
    const teamLeads = [
      {
        name: 'Alex Recovery',
        email: 'alex.lead@nakuja.org',
        role: 'TEAM_LEAD' as const,
        teamId: 'recovery'
      },
      {
        name: 'Emma Avionics',
        email: 'emma.lead@nakuja.org',
        role: 'TEAM_LEAD' as const,
        teamId: 'avionics'
      }
    ]

    for (const lead of teamLeads) {
      const hashedPassword = await bcrypt.hash('lead123', 10)
      await prisma.user.upsert({
        where: { email: lead.email },
        update: {},
        create: {
          ...lead,
          password: hashedPassword,
          isActive: true
        }
      })
    }

    console.log('✅ Created team leads')

    // Create specialized leads
    const specializedLeads = [
      {
        name: 'David Purchase',
        email: 'david.purchasing@nakuja.org',
        role: 'PURCHASING_LEAD' as const,
        teamId: 'recovery'
      },
      {
        name: 'Maria Inventory',
        email: 'maria.inventory@nakuja.org',
        role: 'INVENTORY_LEAD' as const,
        teamId: 'avionics'
      },
      {
        name: 'Tom Supervisor',
        email: 'tom.supervisor@nakuja.org',
        role: 'SUPERVISOR' as const,
        teamId: 'telemetry'
      }
    ]

    for (const lead of specializedLeads) {
      const hashedPassword = await bcrypt.hash('lead123', 10)
      await prisma.user.upsert({
        where: { email: lead.email },
        update: {},
        create: {
          ...lead,
          password: hashedPassword,
          isActive: true
        }
      })
    }

    console.log('✅ Created specialized leads')

    // Create demo members
    const members = [
      {
        name: 'Jane Member',
        email: 'jane.member@nakuja.org',
        role: 'MEMBER' as const,
        teamId: 'recovery'
      },
      {
        name: 'Bob Builder',
        email: 'bob.member@nakuja.org',
        role: 'MEMBER' as const,
        teamId: 'avionics'
      }
    ]

    for (const member of members) {
      const hashedPassword = await bcrypt.hash('member123', 10)
      await prisma.user.upsert({
        where: { email: member.email },
        update: {},
        create: {
          ...member,
          password: hashedPassword,
          isActive: true
        }
      })
    }

    console.log('✅ Created demo members')

    // Update team leads to be assigned to their teams
    await prisma.team.update({
      where: { id: 'recovery' },
      data: {
        leadId: (await prisma.user.findUnique({ where: { email: 'alex.lead@nakuja.org' } }))?.id
      }
    })

    await prisma.team.update({
      where: { id: 'avionics' },
      data: {
        leadId: (await prisma.user.findUnique({ where: { email: 'emma.lead@nakuja.org' } }))?.id
      }
    })

    console.log('✅ Assigned team leads')

    // Create some sample inventory data
    const inventoryItems = [
      {
        name: 'Flight Computer Board',
        description: 'Main flight computer for rocket guidance',
        category: 'Electronics',
        quantity: 5,
        price: 150.00,
        supplier: 'TechCorp',
        location: 'Storage Room A',
        teamId: 'avionics'
      },
      {
        name: 'Parachute Fabric',
        description: 'High-strength nylon fabric for main parachute',
        category: 'Materials',
        quantity: 10,
        price: 75.00,
        supplier: 'Parachute Supplies Inc',
        location: 'Storage Room B',
        teamId: 'recovery'
      },
      {
        name: 'Telemetry Module',
        description: 'Radio transmitter for real-time data',
        category: 'Electronics',
        quantity: 3,
        price: 200.00,
        supplier: 'RadioTech',
        location: 'Electronics Lab',
        teamId: 'telemetry'
      }
    ]

    for (const item of inventoryItems) {
      await prisma.inventoryItem.upsert({
        where: { 
          name_teamId: { 
            name: item.name, 
            teamId: item.teamId 
          } 
        },
        update: {},
        create: item
      })
    }

    console.log('✅ Created sample inventory items')

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📋 Account Summary:')
    console.log('👑 Super Admin: admin@nakuja.org (password: admin123)')
    console.log('🔧 Admin Accounts:')
    console.log('  - john.admin@nakuja.org (password: admin123)')
    console.log('  - sarah.admin@nakuja.org (password: admin123)')
    console.log('  - mike.admin@nakuja.org (password: admin123)')
    console.log('  - lisa.admin@nakuja.org (password: admin123)')
    console.log('👥 Team Leads:')
    console.log('  - alex.lead@nakuja.org (password: lead123)')
    console.log('  - emma.lead@nakuja.org (password: lead123)')
    console.log('🏷️ Specialized Leads:')
    console.log('  - david.purchasing@nakuja.org (password: lead123)')
    console.log('  - maria.inventory@nakuja.org (password: lead123)')
    console.log('  - tom.supervisor@nakuja.org (password: lead123)')
    console.log('👤 Demo Members:')
    console.log('  - jane.member@nakuja.org (password: member123)')
    console.log('  - bob.member@nakuja.org (password: member123)')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
