const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestCompletedBookings() {
  try {
    console.log('🔧 Creating test completed bookings for review testing...\n')

    // Get some users and facilities
    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      take: 3
    })

    const facilities = await prisma.facility.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        courts: true
      },
      take: 3
    })

    console.log(`Found ${users.length} users and ${facilities.length} facilities`)

    // Create some past completed bookings
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    const bookingsToCreate = []

    // User 1 - completed booking at facility 1 (can review)
    if (users[0] && facilities[0] && facilities[0].courts[0]) {
      bookingsToCreate.push({
        userId: users[0].id,
        facilityId: facilities[0].id,
        courtId: facilities[0].courts[0].id,
        bookingDate: yesterday,
        startTime: '10:00',
        endTime: '11:00',
        duration: 1,
        pricePerHour: 500,
        totalPrice: 500,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      })
    }

    // User 2 - completed booking at facility 2 (can review)
    if (users[1] && facilities[1] && facilities[1].courts[0]) {
      bookingsToCreate.push({
        userId: users[1].id,
        facilityId: facilities[1].id,
        courtId: facilities[1].courts[0].id,
        bookingDate: twoDaysAgo,
        startTime: '14:00',
        endTime: '16:00',
        duration: 2,
        pricePerHour: 600,
        totalPrice: 1200,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      })
    }

    // User 3 - completed booking at facility 3 (can review)
    if (users[2] && facilities[2] && facilities[2].courts[0]) {
      bookingsToCreate.push({
        userId: users[2].id,
        facilityId: facilities[2].id,
        courtId: facilities[2].courts[0].id,
        bookingDate: lastWeek,
        startTime: '18:00',
        endTime: '19:00',
        duration: 1,
        pricePerHour: 800,
        totalPrice: 800,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      })
    }

    // User 1 - another completed booking at facility 2 (can review another facility)
    if (users[0] && facilities[1] && facilities[1].courts[0]) {
      bookingsToCreate.push({
        userId: users[0].id,
        facilityId: facilities[1].id,
        courtId: facilities[1].courts[0].id,
        bookingDate: lastWeek,
        startTime: '09:00',
        endTime: '10:00',
        duration: 1,
        pricePerHour: 600,
        totalPrice: 600,
        status: 'CONFIRMED',
        paymentStatus: 'PAID'
      })
    }

    console.log(`Creating ${bookingsToCreate.length} completed bookings...`)

    for (const booking of bookingsToCreate) {
      const user = users.find(u => u.id === booking.userId)
      const facility = facilities.find(f => f.id === booking.facilityId)
      
      const created = await prisma.booking.create({
        data: booking
      })

      console.log(`✅ Created booking: ${user.fullName} at ${facility.name} on ${booking.bookingDate.toDateString()}`)
    }

    console.log('\n🎉 Test completed bookings created successfully!')
    console.log('\n💡 Users can now write reviews for facilities they have completed bookings at.')
    console.log('📱 Visit http://localhost:3001/book/[facility-id] to test the review system!')

  } catch (error) {
    console.error('❌ Error creating test bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCompletedBookings()
