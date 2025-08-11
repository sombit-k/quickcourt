'use server'

import { db } from '@/lib/prisma'

export async function createCourt(courtData) {
  try {
    const court = await db.court.create({
      data: {
        name: courtData.name,
        sportType: courtData.sportType,
        pricePerHour: courtData.pricePerHour,
        description: courtData.description,
        images: JSON.stringify(courtData.images || []),
        facilityId: courtData.facilityId,
        isActive: true
      }
    })

    return court
  } catch (error) {
    console.error('Error creating court:', error)
    throw new Error('Failed to create court')
  }
}

export async function updateCourt(courtId, courtData) {
  try {
    const court = await db.court.update({
      where: { id: courtId },
      data: {
        name: courtData.name,
        sportType: courtData.sportType,
        pricePerHour: courtData.pricePerHour,
        description: courtData.description,
        images: JSON.stringify(courtData.images || []),
        isActive: courtData.isActive
      }
    })

    return court
  } catch (error) {
    console.error('Error updating court:', error)
    throw new Error('Failed to update court')
  }
}

export async function deleteCourt(courtId) {
  try {
    // Check if court has any future bookings
    const futureBookings = await db.booking.count({
      where: {
        courtId,
        bookingDate: {
          gte: new Date()
        },
        status: 'CONFIRMED'
      }
    })

    if (futureBookings > 0) {
      throw new Error('Cannot delete court with active bookings')
    }

    await db.court.delete({
      where: { id: courtId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting court:', error)
    throw new Error(error.message || 'Failed to delete court')
  }
}

export async function getCourtsByFacility(facilityId) {
  try {
    const courts = await db.court.findMany({
      where: { facilityId },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                bookingDate: {
                  gte: new Date()
                },
                status: 'CONFIRMED'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return courts
  } catch (error) {
    console.error('Error fetching courts:', error)
    throw new Error('Failed to fetch courts')
  }
}

export async function getCourtById(courtId) {
  try {
    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          include: {
            owner: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        bookings: {
          where: {
            bookingDate: {
              gte: new Date()
            }
          },
          select: {
            bookingDate: true,
            startTime: true,
            endTime: true,
            status: true,
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
        }
      }
    })

    return court
  } catch (error) {
    console.error('Error fetching court:', error)
    throw new Error('Failed to fetch court')
  }
}

export async function getAvailableTimeSlots(courtId, date) {
  try {
    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          select: {
            operatingHours: true
          }
        }
      }
    })

    if (!court) {
      throw new Error('Court not found')
    }

    // Get existing bookings for the date
    const bookings = await db.booking.findMany({
      where: {
        courtId,
        bookingDate: new Date(date),
        status: 'CONFIRMED'
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // Get blocked time slots for the date
    const blockedSlots = await db.blockedTimeSlot.findMany({
      where: {
        OR: [
          { courtId },
          { facilityId: court.facilityId }
        ],
        date: new Date(date)
      },
      select: {
        startTime: true,
        endTime: true
      }
    })

    // Generate available time slots based on operating hours
    const operatingHours = court.facility.operatingHours ? 
      JSON.parse(court.facility.operatingHours) : 
      { start: '06:00', end: '22:00' }
    
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' })
    const dayHours = operatingHours[dayOfWeek] || operatingHours.default || operatingHours

    const allSlots = generateTimeSlots(dayHours.start, dayHours.end)
    const bookedTimes = [...bookings, ...blockedSlots].map(b => ({
      start: b.startTime,
      end: b.endTime
    }))

    const availableSlots = allSlots.filter(slot => {
      return !bookedTimes.some(booked => 
        (slot.start >= booked.start && slot.start < booked.end) ||
        (slot.end > booked.start && slot.end <= booked.end) ||
        (slot.start <= booked.start && slot.end >= booked.end)
      )
    })

    return availableSlots
  } catch (error) {
    console.error('Error fetching available time slots:', error)
    throw new Error('Failed to fetch available time slots')
  }
}

function generateTimeSlots(startTime, endTime) {
  const slots = []
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  
  for (let time = start; time < end; time += 60) { // 1-hour slots
    const slotStart = minutesToTime(time)
    const slotEnd = minutesToTime(time + 60)
    
    slots.push({
      start: slotStart,
      end: slotEnd,
      display: `${slotStart} - ${slotEnd}`
    })
  }
  
  return slots
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export async function createBlockedTimeSlot(slotData) {
  try {
    const blockedSlot = await db.blockedTimeSlot.create({
      data: {
        date: new Date(slotData.date),
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        reason: slotData.reason,
        description: slotData.description,
        facilityId: slotData.facilityId,
        courtId: slotData.courtId
      }
    })

    return blockedSlot
  } catch (error) {
    console.error('Error creating blocked time slot:', error)
    throw new Error('Failed to create blocked time slot')
  }
}

export async function removeBlockedTimeSlot(slotId) {
  try {
    await db.blockedTimeSlot.delete({
      where: { id: slotId }
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing blocked time slot:', error)
    throw new Error('Failed to remove blocked time slot')
  }
}

export async function getBlockedTimeSlots(facilityId, courtId = null, date = null) {
  try {
    const where = {
      facilityId
    }

    if (courtId) {
      where.courtId = courtId
    }

    if (date) {
      where.date = new Date(date)
    }

    const blockedSlots = await db.blockedTimeSlot.findMany({
      where,
      include: {
        court: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return blockedSlots
  } catch (error) {
    console.error('Error fetching blocked time slots:', error)
    throw new Error('Failed to fetch blocked time slots')
  }
}
