import { currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const clerkUser = await currentUser()
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to verify they're a facility owner
    const user = await db.user.findUnique({
      where: { clerkId: clerkUser.id }
    })

    if (!user || user.role !== 'FACILITY_OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { facilityIds } = await request.json()

    if (!facilityIds || !Array.isArray(facilityIds)) {
      return NextResponse.json({ error: 'Invalid facility IDs' }, { status: 400 })
    }

    // Verify user owns these facilities
    const ownedFacilities = await db.facility.findMany({
      where: {
        id: { in: facilityIds },
        ownerId: user.id
      },
      select: { id: true }
    })

    const ownedFacilityIds = ownedFacilities.map(f => f.id)

    // Get all bookings for owned facilities
    const bookings = await db.booking.findMany({
      where: {
        facilityId: { in: ownedFacilityIds }
      },
      include: {
        court: {
          select: {
            name: true,
            sportType: true
          }
        },
        facility: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(bookings)

  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
