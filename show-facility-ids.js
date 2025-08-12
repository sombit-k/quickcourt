const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showFacilityIDs() {
  try {
    console.log('🏢 Facility IDs for Testing Review System:\n')

    const facilities = await prisma.facility.findMany({
      where: {
        status: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        rating: true,
        totalReviews: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    facilities.forEach(facility => {
      console.log(`📍 ${facility.name}`)
      console.log(`   ID: ${facility.id}`)
      console.log(`   URL: http://localhost:3001/book/${facility.id}`)
      console.log(`   Rating: ${facility.rating}/5 (${facility.totalReviews} reviews)`)
      console.log(`   Bookings: ${facility._count.bookings}`)
      console.log('')
    })

    // Show facilities with completed bookings that can be reviewed
    console.log('✨ Facilities with Completed Bookings (Good for Review Testing):')
    
    const facilitiesWithBookings = await prisma.facility.findMany({
      where: {
        status: 'APPROVED',
        bookings: {
          some: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            bookingDate: {
              lt: new Date()
            }
          }
        }
      },
      include: {
        bookings: {
          where: {
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            bookingDate: {
              lt: new Date()
            }
          },
          include: {
            user: {
              select: {
                fullName: true,
                clerkId: true
              }
            }
          }
        }
      }
    })

    facilitiesWithBookings.forEach(facility => {
      console.log(`\n🎯 ${facility.name} (ID: ${facility.id})`)
      console.log(`   Review URL: http://localhost:3001/book/${facility.id}`)
      console.log(`   Users who can review:`)
      facility.bookings.forEach(booking => {
        console.log(`   - ${booking.user.fullName} (Clerk ID: ${booking.user.clerkId})`)
      })
    })

    console.log('\n💡 To test reviews:')
    console.log('1. Sign in with one of the users who have completed bookings')
    console.log('2. Visit the facility URL')
    console.log('3. Scroll down to see the Reviews section')
    console.log('4. Click "Write a Review" button')

  } catch (error) {
    console.error('❌ Error fetching facility IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showFacilityIDs()
