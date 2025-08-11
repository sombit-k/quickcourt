'use server'

import { db } from '@/lib/prisma'

export async function createBooking(bookingData) {
  try {
    // Verify court is available for the requested time slot
    const existingBooking = await db.booking.findFirst({
      where: {
        courtId: bookingData.courtId,
        bookingDate: new Date(bookingData.bookingDate),
        startTime: bookingData.startTime,
        status: 'CONFIRMED'
      }
    })

    if (existingBooking) {
      throw new Error('This time slot is already booked')
    }

    // Check for blocked time slots
    const blockedSlot = await db.blockedTimeSlot.findFirst({
      where: {
        OR: [
          { courtId: bookingData.courtId },
          { facilityId: bookingData.facilityId }
        ],
        date: new Date(bookingData.bookingDate),
        startTime: {
          lte: bookingData.startTime
        },
        endTime: {
          gte: bookingData.endTime
        }
      }
    })

    if (blockedSlot) {
      throw new Error('This time slot is not available')
    }

    const booking = await db.booking.create({
      data: {
        userId: bookingData.userId,
        facilityId: bookingData.facilityId,
        courtId: bookingData.courtId,
        bookingDate: new Date(bookingData.bookingDate),
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        duration: bookingData.duration,
        pricePerHour: bookingData.pricePerHour,
        totalPrice: bookingData.totalPrice,
        notes: bookingData.notes,
        status: 'CONFIRMED',
        paymentStatus: 'PAID' // Simulated payment
      },
      include: {
        facility: {
          select: {
            name: true,
            address: true
          }
        },
        court: {
          select: {
            name: true,
            sportType: true
          }
        }
      }
    })

    return booking
  } catch (error) {
    console.error('Error creating booking:', error)
    throw new Error(error.message || 'Failed to create booking')
  }
}

export async function cancelBooking(bookingId, userId, reason = null) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.userId !== userId) {
      throw new Error('You can only cancel your own bookings')
    }

    if (booking.status !== 'CONFIRMED') {
      throw new Error('Only confirmed bookings can be cancelled')
    }

    // Check if booking is in the future
    const bookingDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}`)
    const now = new Date()
    
    if (bookingDateTime <= now) {
      throw new Error('Cannot cancel past bookings')
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
        paymentStatus: 'REFUNDED'
      },
      include: {
        facility: {
          select: {
            name: true
          }
        },
        court: {
          select: {
            name: true,
            sportType: true
          }
        }
      }
    })

    return updatedBooking
  } catch (error) {
    console.error('Error cancelling booking:', error)
    throw new Error(error.message || 'Failed to cancel booking')
  }
}

export async function getUserBookings(userId, status = null, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    
    const where = { userId }
    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          facility: {
            select: {
              name: true,
              address: true,
              city: true
            }
          },
          court: {
            select: {
              name: true,
              sportType: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      db.booking.count({ where })
    ])

    return {
      bookings,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    throw new Error('Failed to fetch bookings')
  }
}

export async function getFacilityBookings(facilityId, status = null, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit
    
    const where = { facilityId }
    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        skip: offset,
        take: limit,
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
          }
        },
        orderBy: {
          bookingDate: 'desc'
        }
      }),
      db.booking.count({ where })
    ])

    return {
      bookings,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching facility bookings:', error)
    throw new Error('Failed to fetch facility bookings')
  }
}

export async function getBookingById(bookingId) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        facility: {
          select: {
            name: true,
            description: true,
            address: true,
            city: true,
            state: true,
            phone: true
          }
        },
        court: {
          select: {
            name: true,
            sportType: true,
            description: true
          }
        }
      }
    })

    return booking
  } catch (error) {
    console.error('Error fetching booking:', error)
    throw new Error('Failed to fetch booking')
  }
}

export async function markBookingComplete(bookingId) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    // Check if booking date has passed
    const bookingDateTime = new Date(`${booking.bookingDate.toISOString().split('T')[0]}T${booking.endTime}`)
    const now = new Date()
    
    if (bookingDateTime > now) {
      throw new Error('Cannot mark future bookings as complete')
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED'
      }
    })

    return updatedBooking
  } catch (error) {
    console.error('Error marking booking complete:', error)
    throw new Error(error.message || 'Failed to mark booking complete')
  }
}

export async function getBookingStats(facilityId = null, startDate = null, endDate = null) {
  try {
    const where = {}
    
    if (facilityId) {
      where.facilityId = facilityId
    }

    if (startDate || endDate) {
      where.bookingDate = {}
      if (startDate) {
        where.bookingDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.bookingDate.lte = new Date(endDate)
      }
    }

    const [
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue,
      sportTypeStats
    ] = await Promise.all([
      db.booking.count({ where }),
      db.booking.count({ where: { ...where, status: 'CONFIRMED' } }),
      db.booking.count({ where: { ...where, status: 'CANCELLED' } }),
      db.booking.count({ where: { ...where, status: 'COMPLETED' } }),
      db.booking.aggregate({
        where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        _sum: { totalPrice: true }
      }),
      db.booking.groupBy({
        by: ['courtId'],
        where,
        _count: { _all: true },
        _sum: { totalPrice: true }
      })
    ])

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      sportTypeStats
    }
  } catch (error) {
    console.error('Error fetching booking stats:', error)
    throw new Error('Failed to fetch booking statistics')
  }
}

export async function getBookingCalendarData(facilityId, year, month) {
  try {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const bookings = await db.booking.findMany({
      where: {
        facilityId,
        bookingDate: {
          gte: startDate,
          lte: endDate
        },
        status: 'CONFIRMED'
      },
      select: {
        bookingDate: true,
        startTime: true,
        endTime: true,
        court: {
          select: {
            name: true,
            sportType: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      }
    })

    // Group bookings by date
    const calendarData = {}
    bookings.forEach(booking => {
      const dateKey = booking.bookingDate.toISOString().split('T')[0]
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = []
      }
      calendarData[dateKey].push(booking)
    })

    return calendarData
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    throw new Error('Failed to fetch calendar data')
  }
}
