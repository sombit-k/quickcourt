import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to verify they're a facility owner
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'FACILITY_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user's facilities
    const facilities = await db.facility.findMany({
      where: { ownerId: user.id },
      include: {
        courts: {
          where: { isActive: true }
        },
        bookings: {
          include: {
            court: true,
            facility: true
          }
        }
      }
    })

    const facilityIds = facilities.map(f => f.id)
    const courtIds = facilities.flatMap(f => f.courts.map(c => c.id))

    // Calculate metrics
    const totalBookings = await db.booking.count({
      where: {
        OR: [
          { facilityId: { in: facilityIds } },
          { courtId: { in: courtIds } }
        ]
      }
    })

    const activeCourts = await prisma.court.count({
      where: {
        facilityId: { in: facilityIds },
        isActive: true
      }
    })

    // Calculate earnings
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const earningsData = await db.booking.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        OR: [
          { facilityId: { in: facilityIds } },
          { courtId: { in: courtIds } }
        ],
        status: 'CONFIRMED'
      }
    })

    const monthlyEarningsData = await db.booking.aggregate({
      _sum: {
        totalAmount: true
      },
      where: {
        OR: [
          { facilityId: { in: facilityIds } },
          { courtId: { in: courtIds } }
        ],
        status: 'CONFIRMED',
        createdAt: {
          gte: currentMonth
        }
      }
    })

    // Get upcoming bookings
    const upcomingBookings = await db.booking.findMany({
      where: {
        OR: [
          { facilityId: { in: facilityIds } },
          { courtId: { in: courtIds } }
        ],
        date: {
          gte: new Date()
        }
      },
      include: {
        court: true,
        facility: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 10
    })

    return NextResponse.json({
      totalBookings,
      activeCourts,
      totalEarnings: earningsData._sum.totalAmount || 0,
      monthlyEarnings: monthlyEarningsData._sum.totalAmount || 0,
      upcomingBookings
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
