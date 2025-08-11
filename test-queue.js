// Test script to verify queue system functionality
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testQueueSystem() {
  try {
    console.log('🔧 Testing Queue System...\n')

    // Test data - using string for courtId and correct field names
    const testCourtId = 'clm123456789' // String courtId
    const testDate = new Date('2025-01-15')
    const testStartTime = '14:00'
    const testUserId = 'test-user-1'

    // 1. Test creating a booking in queue
    console.log('1️⃣ Testing createBookingWithQueue...')
    
    // Simulate the queue creation logic with correct field names
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId: testCourtId,
        bookingDate: testDate,
        startTime: testStartTime,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (existingBooking) {
      console.log('✅ Found existing booking - queue logic should activate')
      
      // Check queue position
      const queueCount = await prisma.booking.count({
        where: {
          courtId: testCourtId,
          bookingDate: testDate,
          startTime: testStartTime,
          isInQueue: true
        }
      })
      
      console.log(`📊 Current queue count: ${queueCount}`)
      console.log(`📍 Next queue position would be: ${queueCount + 1}`)
    } else {
      console.log('🎯 No existing booking - direct booking should be created')
    }

    // 2. Test cleanup expired payments
    console.log('\n2️⃣ Testing expired payment cleanup...')
    
    const expiredBookings = await prisma.booking.findMany({
      where: {
        paymentStartedAt: { not: null },
        paymentExpiresAt: { lt: new Date() },
        status: 'PENDING'
      }
    })
    
    console.log(`🧹 Found ${expiredBookings.length} expired bookings`)

    // 3. Test queue promotion
    console.log('\n3️⃣ Testing queue promotion logic...')
    
    const queuedBookings = await prisma.booking.findMany({
      where: {
        isInQueue: true,
        courtId: testCourtId,
        bookingDate: testDate,
        startTime: testStartTime
      },
      orderBy: { queuePosition: 'asc' }
    })
    
    console.log(`🚀 Found ${queuedBookings.length} bookings in queue`)
    
    if (queuedBookings.length > 0) {
      console.log(`👑 Next in queue: Position ${queuedBookings[0].queuePosition}`)
    }

    // 4. Display current booking status
    console.log('\n4️⃣ Current booking status for test slot...')
    
    const allBookings = await prisma.booking.findMany({
      where: {
        courtId: testCourtId,
        bookingDate: testDate,
        startTime: testStartTime
      },
      orderBy: [
        { isInQueue: 'asc' },
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ]
    })
    
    console.log(`📋 Total bookings for slot: ${allBookings.length}`)
    allBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.isInQueue ? '🔄 Queue' : '🎯 Direct'} - Status: ${booking.status} - Position: ${booking.queuePosition || 'N/A'}`)
    })

    // 5. Show all existing bookings to understand current state
    console.log('\n5️⃣ All existing bookings in database...')
    const allDbBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`📊 Total bookings in DB: ${allDbBookings.length}`)
    allDbBookings.forEach((booking, index) => {
      console.log(`${index + 1}. Court: ${booking.courtId} | Date: ${booking.bookingDate.toISOString().split('T')[0]} | Time: ${booking.startTime} | Status: ${booking.status}`)
    })

    console.log('\n✅ Queue system test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testQueueSystem()
