'use server'

import { db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

// Create booking with queue management
export async function createBookingWithQueue(bookingData) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

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

    // Check for existing bookings in the same time slot
    const conflictingBookings = await db.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        paymentStatus: {
          not: 'FAILED'
        }
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    let queuePosition = 1
    let isInQueue = false
    
    // If there are conflicting bookings, determine queue position
    if (conflictingBookings.length > 0) {
      // Check if any booking has payment in progress or completed
      const activeBooking = conflictingBookings.find(
        b => b.paymentStatus === 'PAID' || 
            (b.paymentStatus === 'PROCESSING' && 
             b.paymentExpiresAt && 
             b.paymentExpiresAt > new Date())
      )

      if (activeBooking) {
        // If there's an active booking (paid or payment in progress), put this in queue
        isInQueue = true
        queuePosition = Math.max(...conflictingBookings.map(b => b.queuePosition || 0)) + 1
      } else {
        // No active payment, check for expired payments and clean them up
        await cleanupExpiredPayments(courtId, bookingDate, startTime, endTime)
        
        // Recheck after cleanup
        const remainingBookings = await db.booking.findMany({
          where: {
            courtId,
            bookingDate: new Date(bookingDate),
            startTime,
            endTime,
            status: {
              in: ['PENDING', 'CONFIRMED']
            },
            paymentStatus: {
              not: 'FAILED'
            }
          }
        })

        if (remainingBookings.length > 0) {
          isInQueue = true
          queuePosition = remainingBookings.length + 1
        }
      }
    }

    // Set payment expiry time (10 minutes from now)
    const paymentExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    const queueExpiresAt = isInQueue ? new Date(Date.now() + 30 * 60 * 1000) : null

    // Create the booking
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
        queuePosition: isInQueue ? queuePosition : null,
        isInQueue,
        queueExpiresAt,
        paymentExpiresAt,
        paymentStartedAt: new Date()
      },
      include: {
        facility: true,
        court: true,
        user: true
      }
    })

    return {
      success: true,
      booking,
      queueInfo: {
        isInQueue,
        queuePosition,
        estimatedWaitTime: isInQueue ? queuePosition * 10 : 0, // 10 minutes per position
        conflictingBookings: conflictingBookings.length
      }
    }

  } catch (error) {
    console.error('Error creating booking with queue:', error)
    return {
      success: false,
      message: error.message || 'Failed to create booking'
    }
  }
}

// Clean up expired payments and promote queue
export async function cleanupExpiredPayments(courtId, bookingDate, startTime, endTime) {
  try {
    const now = new Date()
    
    // Find expired payments
    const expiredBookings = await db.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        paymentStatus: {
          in: ['PENDING', 'PROCESSING']
        },
        paymentExpiresAt: {
          lt: now
        }
      }
    })

    // Mark expired bookings as failed
    for (const booking of expiredBookings) {
      await db.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          cancelReason: 'Payment expired'
        }
      })
    }

    // Promote next in queue
    await promoteNextInQueue(courtId, bookingDate, startTime, endTime)

  } catch (error) {
    console.error('Error cleaning up expired payments:', error)
  }
}

// Promote next booking in queue to primary position
export async function promoteNextInQueue(courtId, bookingDate, startTime, endTime) {
  try {
    // Find next booking in queue
    const nextInQueue = await db.booking.findFirst({
      where: {
        courtId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        isInQueue: true,
        status: 'PENDING',
        paymentStatus: {
          in: ['PENDING', 'PROCESSING']
        },
        queueExpiresAt: {
          gt: new Date()
        }
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    if (nextInQueue) {
      // Promote to primary position
      await db.booking.update({
        where: { id: nextInQueue.id },
        data: {
          isInQueue: false,
          queuePosition: null,
          queueExpiresAt: null,
          paymentStartedAt: new Date(),
          paymentExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // Reset payment timer
        }
      })

      // Notify user they've been promoted (you can implement this)
      console.log(`Booking ${nextInQueue.id} promoted from queue`)
    }

  } catch (error) {
    console.error('Error promoting next in queue:', error)
  }
}

// Complete payment and confirm booking
export async function completeBookingPayment(bookingId) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        court: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.user.clerkId !== user.id) {
      throw new Error('Unauthorized')
    }

    // Check if payment window is still valid
    if (booking.paymentExpiresAt && booking.paymentExpiresAt < new Date()) {
      throw new Error('Payment window expired')
    }

    // Update booking to confirmed and paid
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paidAt: new Date(),
        isInQueue: false,
        queuePosition: null,
        queueExpiresAt: null
      }
    })

    // Cancel other bookings for the same slot
    await db.booking.updateMany({
      where: {
        courtId: booking.courtId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        id: { not: bookingId },
        status: { not: 'CONFIRMED' }
      },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'CANCELLED',
        cancelReason: 'Slot booked by another user'
      }
    })

    return {
      success: true,
      booking: updatedBooking,
      message: 'Payment completed and booking confirmed'
    }

  } catch (error) {
    console.error('Error completing payment:', error)
    return {
      success: false,
      message: error.message || 'Failed to complete payment'
    }
  }
}

// Get queue status for a booking
export async function getBookingQueueStatus(bookingId) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        court: true,
        facility: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Get current queue for this time slot
    const queueBookings = await db.booking.findMany({
      where: {
        courtId: booking.courtId,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        },
        paymentStatus: {
          not: 'FAILED'
        }
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return {
      success: true,
      booking,
      queueInfo: {
        totalInQueue: queueBookings.length,
        userPosition: booking.queuePosition,
        isInQueue: booking.isInQueue,
        paymentExpiresAt: booking.paymentExpiresAt,
        queueExpiresAt: booking.queueExpiresAt,
        estimatedWaitTime: booking.queuePosition ? (booking.queuePosition - 1) * 10 : 0
      },
      queueBookings: queueBookings.map(b => ({
        id: b.id,
        userName: `${b.user.firstName} ${b.user.lastName}`,
        position: b.queuePosition,
        paymentStatus: b.paymentStatus,
        isCurrentUser: b.userId === booking.userId
      }))
    }

  } catch (error) {
    console.error('Error getting queue status:', error)
    return {
      success: false,
      message: error.message || 'Failed to get queue status'
    }
  }
}
