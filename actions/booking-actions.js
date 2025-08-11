'use server'

import { db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function createBooking(bookingData) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found in database')
    }

    const {
      facilityId,
      courtId,
      bookingDate,
      startTime,
      endTime,
      duration,
      pricePerHour,
      totalPrice,
      notes
    } = bookingData

    // Validate booking data
    if (!facilityId || !courtId || !bookingDate || !startTime || !endTime) {
      throw new Error('Missing required booking information')
    }

    // Check if the time slot is available
    const conflictingBooking = await db.booking.findFirst({
      where: {
        courtId,
        bookingDate: new Date(bookingDate),
        status: 'CONFIRMED', // Only check confirmed bookings for conflicts
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      throw new Error('This time slot is already booked')
    }

    // Check for blocked time slots
    const blockedSlot = await db.blockedTimeSlot.findFirst({
      where: {
        OR: [
          { facilityId },
          { courtId }
        ],
        date: new Date(bookingDate),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ]
      }
    })

    if (blockedSlot) {
      throw new Error('This time slot is not available due to maintenance or private events')
    }

    // Create the booking with PENDING status (awaiting facility manager approval)
    const booking = await db.booking.create({
      data: {
        userId: dbUser.id,
        facilityId,
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        duration,
        pricePerHour,
        totalPrice,
        notes: notes || null,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        facility: true,
        court: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return {
      success: true,
      booking,
      message: 'Booking request submitted successfully. Awaiting facility manager approval.'
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return {
      success: false,
      message: error.message || 'Failed to create booking'
    }
  }
}

export async function getAvailableTimeSlots(courtId, date) {
  try {
    const bookingDate = new Date(date)
    
    // Get all bookings for this court on this date
    const existingBookings = await db.booking.findMany({
      where: {
        courtId,
        bookingDate,
        status: 'CONFIRMED' // Only get confirmed bookings
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // Get blocked time slots
    const blockedSlots = await db.blockedTimeSlot.findMany({
      where: {
        OR: [
          { courtId },
          { court: { facilityId: { in: await getFacilityIdForCourt(courtId) } } }
        ],
        date: bookingDate
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // All possible time slots (assuming 1-hour slots from 6 AM to 11 PM)
    const allTimeSlots = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ]

    // Filter out booked and blocked slots
    const availableSlots = allTimeSlots.filter(slot => {
      const endSlot = String(parseInt(slot.split(':')[0]) + 1).padStart(2, '0') + ':00'
      
      // Check if slot conflicts with existing bookings
      const isBooked = existingBookings.some(booking => 
        (slot >= booking.startTime && slot < booking.endTime) ||
        (endSlot > booking.startTime && endSlot <= booking.endTime)
      )

      // Check if slot conflicts with blocked slots
      const isBlocked = blockedSlots.some(blocked => 
        (slot >= blocked.startTime && slot < blocked.endTime) ||
        (endSlot > blocked.startTime && endSlot <= blocked.endTime)
      )

      return !isBooked && !isBlocked
    })

    return availableSlots
  } catch (error) {
    console.error('Error getting available time slots:', error)
    return []
  }
}

async function getFacilityIdForCourt(courtId) {
  const court = await db.court.findUnique({
    where: { id: courtId },
    select: { facilityId: true }
  })
  return court ? [court.facilityId] : []
}

export async function cancelBooking(bookingId, reason) {
  try {
    console.log('cancelBooking called with:', { bookingId, reason })
    
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    console.log('Current user:', { id: user.id, email: user.emailAddresses?.[0]?.emailAddress })

    // Find the booking first
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        facility: true,
        court: true
      }
    })

    console.log('Found booking:', booking ? { id: booking.id, status: booking.status, userClerkId: booking.user?.clerkId } : 'Not found')

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Verify ownership using Clerk ID
    if (booking.user.clerkId !== user.id) {
      throw new Error('You do not have permission to cancel this booking')
    }

    // Check if booking is approved - users can only cancel pending bookings
    if (booking.status === 'CONFIRMED') {
      throw new Error('Cannot cancel approved bookings. Please contact the facility to cancel.')
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('Booking is already cancelled')
    }

    if (booking.status === 'REJECTED') {
      throw new Error('Cannot cancel rejected bookings')
    }

    // Check if booking can be cancelled (e.g., not already in the past)
    const bookingDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}`)
    const now = new Date()
    
    if (bookingDateTime <= now) {
      throw new Error('Cannot cancel bookings that have already started or passed')
    }

    // Update booking status
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason || 'Cancelled by user',
        updatedAt: new Date()
      },
      include: {
        facility: true,
        court: true
      }
    })

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking cancelled successfully'
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return {
      success: false,
      message: error.message || 'Failed to cancel booking'
    }
  }
}

export async function getUserBookings(clerkId) {
  try {
    if (!clerkId) {
      throw new Error('User ID required')
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        bookings: {
          include: {
            facility: true,
            court: true
          },
          orderBy: {
            bookingDate: 'desc'
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user.bookings
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    throw new Error('Failed to fetch bookings')
  }
}

// Get pending bookings for facility manager
export async function getPendingBookingsForFacility(facilityId) {
  try {
    if (!facilityId) {
      throw new Error('Facility ID is required')
    }
    
    const bookings = await db.booking.findMany({
      where: {
        facilityId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bookings
  } catch (error) {
    console.error('Error fetching pending bookings:', error)
    throw new Error('Failed to fetch pending bookings')
  }
}

// Approve a booking
export async function approveBooking(bookingId) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if user is facility owner
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      throw new Error('Unauthorized: Only facility owners can approve bookings')
    }

    // Get the booking to verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        facility: {
          select: {
            ownerId: true,
            name: true
          }
        }
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.facility.ownerId !== dbUser.id) {
      throw new Error('Unauthorized: You can only approve bookings for your own facilities')
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in pending status')
    }

    // Check for conflicts before approving
    const conflictingBooking = await db.booking.findFirst({
      where: {
        courtId: booking.courtId,
        bookingDate: booking.bookingDate,
        status: 'CONFIRMED',
        id: { not: bookingId },
        OR: [
          {
            AND: [
              { startTime: { lte: booking.startTime } },
              { endTime: { gt: booking.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: booking.endTime } },
              { endTime: { gte: booking.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: booking.startTime } },
              { endTime: { lte: booking.endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      throw new Error('Cannot approve: This time slot has been booked by another confirmed booking')
    }

    // Approve the booking
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        approvedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
        }
      }
    })

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking approved successfully'
    }
  } catch (error) {
    console.error('Error approving booking:', error)
    return {
      success: false,
      message: error.message || 'Failed to approve booking'
    }
  }
}

// Reject a booking
export async function rejectBooking(bookingId, rejectionReason = '') {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Check if user is facility owner
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      throw new Error('Unauthorized: Only facility owners can reject bookings')
    }

    // Get the booking to verify ownership
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        facility: {
          select: {
            ownerId: true,
            name: true
          }
        }
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.facility.ownerId !== dbUser.id) {
      throw new Error('Unauthorized: You can only reject bookings for your own facilities')
    }

    if (booking.status !== 'PENDING') {
      throw new Error('Booking is not in pending status')
    }

    // Reject the booking
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        rejectionReason: rejectionReason || 'Rejected by facility manager',
        rejectedAt: new Date()
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
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
        }
      }
    })

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking rejected successfully'
    }
  } catch (error) {
    console.error('Error rejecting booking:', error)
    return {
      success: false,
      message: error.message || 'Failed to reject booking'
    }
  }
}
