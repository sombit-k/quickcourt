import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to verify they're an admin
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    console.log("user role is ",user.role)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all statistics in parallel for better performance
    const [
      totalUsers,
      totalFacilityOwners,
      totalBookings,
      totalActiveCourts
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total facility owners count
      prisma.user.count({
        where: {
          role: 'FACILITY_OWNER'
        }
      }),
      
      // Total bookings count
      prisma.booking.count(),
      
      // Total active courts count (courts that belong to approved facilities)
      prisma.court.count({
        where: {
          facility: {
            status: 'APPROVED'
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalFacilityOwners,
      totalBookings,
      totalActiveCourts
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
