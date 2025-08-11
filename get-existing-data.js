// Quick script to get existing data for testing
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getExistingData() {
  try {
    console.log('📊 Getting existing database data...\n')
    
    // Get existing users
    const users = await prisma.user.findMany({
      take: 3,
      select: { id: true, clerkId: true, firstName: true, lastName: true }
    })
    
    console.log('👥 Existing Users:')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | Name: ${user.firstName} ${user.lastName}`)
    })
    
    // Get existing facilities
    const facilities = await prisma.facility.findMany({
      take: 3,
      select: { id: true, name: true }
    })
    
    console.log('\n🏢 Existing Facilities:')
    facilities.forEach((facility, index) => {
      console.log(`${index + 1}. ID: ${facility.id} | Name: ${facility.name}`)
    })
    
    // Get existing courts
    const courts = await prisma.court.findMany({
      take: 3,
      select: { id: true, name: true, facilityId: true }
    })
    
    console.log('\n🏀 Existing Courts:')
    courts.forEach((court, index) => {
      console.log(`${index + 1}. ID: ${court.id} | Name: ${court.name} | Facility: ${court.facilityId}`)
    })
    
    return { users, facilities, courts }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getExistingData()
