const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testReviewSystem() {
  try {
    console.log('🧪 Testing Review System...\n')

    // Check existing users and facilities
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        role: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })

    const facilities = await prisma.facility.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        rating: true,
        totalReviews: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })

    console.log(`👥 Users (${users.length}):`)
    users.forEach(user => {
      console.log(`  - ${user.fullName} (${user.role}): ${user._count.bookings} bookings, ${user._count.reviews} reviews`)
    })

    console.log(`\n🏢 Facilities (${facilities.length}):`)
    facilities.forEach(facility => {
      console.log(`  - ${facility.name} (${facility.status}): Rating ${facility.rating}/5 (${facility.totalReviews} reviews), ${facility._count.bookings} bookings`)
    })

    // Check completed bookings (past bookings that can be reviewed)
    const completedBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        bookingDate: {
          lt: new Date() // Past bookings only
        }
      },
      include: {
        user: {
          select: {
            fullName: true
          }
        },
        facility: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`\n📅 Completed Bookings that can be reviewed (${completedBookings.length}):`)
    completedBookings.forEach(booking => {
      console.log(`  - ${booking.user.fullName} at ${booking.facility.name} on ${booking.bookingDate.toDateString()}`)
    })

    // Check existing reviews
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            fullName: true
          }
        },
        facility: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`\n⭐ Existing Reviews (${reviews.length}):`)
    reviews.forEach(review => {
      const reviewer = review.isAnonymous ? 'Anonymous' : review.user.fullName
      console.log(`  - ${reviewer} rated ${review.facility.name}: ${review.rating}/5`)
      if (review.comment) {
        console.log(`    "${review.comment}"`)
      }
      console.log(`    Posted: ${review.createdAt.toDateString()}`)
    })

    // Test review eligibility for each user-facility combination
    console.log(`\n🔍 Review Eligibility Analysis:`)
    for (const user of users) {
      for (const facility of facilities) {
        // Check if user has completed booking at this facility
        const hasBooking = await prisma.booking.findFirst({
          where: {
            userId: user.id,
            facilityId: facility.id,
            status: 'CONFIRMED',
            paymentStatus: 'PAID',
            bookingDate: {
              lt: new Date()
            }
          }
        })

        // Check if user has already reviewed this facility
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: user.id,
            facilityId: facility.id
          }
        })

        const canReview = hasBooking && !existingReview
        const status = !hasBooking ? 'No completed booking' : 
                      existingReview ? 'Already reviewed' : 
                      'Can review'

        if (hasBooking || existingReview) {
          console.log(`  - ${user.fullName} → ${facility.name}: ${status}`)
        }
      }
    }

    console.log('\n✅ Review system test completed!')

  } catch (error) {
    console.error('❌ Error testing review system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testReviewSystem()
