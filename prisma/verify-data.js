const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Verifying seeded data...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        role: true,
        email: true
      }
    });
    console.log(`👥 Users (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.fullName} (${user.role}) - ${user.email}`);
    });
    console.log();

    // Check facilities
    const facilities = await prisma.facility.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        status: true,
        rating: true,
        totalReviews: true,
        _count: {
          select: {
            courts: true,
            bookings: true,
            reviews: true
          }
        }
      }
    });
    console.log(`🏢 Facilities (${facilities.length}):`);
    facilities.forEach(facility => {
      console.log(`  - ${facility.name} in ${facility.city}`);
      console.log(`    Status: ${facility.status}, Rating: ${facility.rating}/5 (${facility.totalReviews} reviews)`);
      console.log(`    Courts: ${facility._count.courts}, Bookings: ${facility._count.bookings}, Reviews: ${facility._count.reviews}`);
    });
    console.log();

    // Check courts
    const courts = await prisma.court.findMany({
      select: {
        id: true,
        name: true,
        sportType: true,
        pricePerHour: true,
        facility: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`🏟️  Courts (${courts.length}):`);
    courts.forEach(court => {
      console.log(`  - ${court.name} (${court.sportType}) at ${court.facility.name} - ₹${court.pricePerHour}/hr`);
    });
    console.log();

    // Check bookings
    const bookings = await prisma.booking.findMany({
      select: {
        id: true,
        bookingDate: true,
        startTime: true,
        endTime: true,
        status: true,
        totalPrice: true,
        user: {
          select: {
            fullName: true
          }
        },
        facility: {
          select: {
            name: true
          }
        },
        court: {
          select: {
            name: true
          }
        }
      }
    });
    console.log(`📅 Bookings (${bookings.length}):`);
    bookings.forEach(booking => {
      console.log(`  - ${booking.user.fullName} booked ${booking.court.name} at ${booking.facility.name}`);
      console.log(`    Date: ${booking.bookingDate.toDateString()}, Time: ${booking.startTime}-${booking.endTime}`);
      console.log(`    Status: ${booking.status}, Total: ₹${booking.totalPrice}`);
    });
    console.log();

    // Check reviews
    const reviews = await prisma.review.findMany({
      select: {
        id: true,
        rating: true,
        comment: true,
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
    });
    console.log(`⭐ Reviews (${reviews.length}):`);
    reviews.forEach(review => {
      console.log(`  - ${review.user.fullName} rated ${review.facility.name}: ${review.rating}/5`);
      console.log(`    "${review.comment}"`);
    });
    console.log();

    // Check analytics
    const analytics = await prisma.analytics.findMany({
      select: {
        date: true,
        totalBookings: true,
        totalRevenue: true,
        newUsers: true,
        activeFacilities: true
      }
    });
    console.log(`📊 Analytics (${analytics.length}):`);
    analytics.forEach(data => {
      console.log(`  - ${data.date.toDateString()}: ${data.totalBookings} bookings, ₹${data.totalRevenue} revenue`);
      console.log(`    New users: ${data.newUsers}, Active facilities: ${data.activeFacilities}`);
    });

    console.log('\n✅ Data verification completed successfully!');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

checkData()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
