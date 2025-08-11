'use server'

import { db } from '@/lib/prisma'

export async function getDashboardStats(facilityId = null) {
  try {
    const where = facilityId ? { facilityId } : {}
    const userWhere = facilityId ? { facilities: { some: { id: facilityId } } } : {}

    const [
      totalUsers,
      totalFacilities,
      totalBookings,
      totalRevenue,
      activeBookings,
      completedBookings,
      cancelledBookings,
      pendingFacilities
    ] = await Promise.all([
      db.user.count({ 
        where: facilityId ? userWhere : { role: 'USER' }
      }),
      db.facility.count({ 
        where: facilityId ? { id: facilityId } : { status: 'APPROVED' }
      }),
      db.booking.count({ where }),
      db.booking.aggregate({
        where: { ...where, status: { in: ['CONFIRMED', 'COMPLETED'] } },
        _sum: { totalPrice: true }
      }),
      db.booking.count({ 
        where: { 
          ...where, 
          status: 'CONFIRMED',
          bookingDate: { gte: new Date() }
        }
      }),
      db.booking.count({ where: { ...where, status: 'COMPLETED' } }),
      db.booking.count({ where: { ...where, status: 'CANCELLED' } }),
      facilityId ? 0 : db.facility.count({ where: { status: 'PENDING' } })
    ])

    return {
      totalUsers,
      totalFacilities,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      activeBookings,
      completedBookings,
      cancelledBookings,
      pendingFacilities
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error('Failed to fetch dashboard statistics')
  }
}

export async function getBookingTrends(facilityId = null, period = '7d') {
  try {
    const where = facilityId ? { facilityId } : {}
    let startDate

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }

    const bookings = await db.booking.findMany({
      where: {
        ...where,
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        totalPrice: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group bookings by date
    const trends = {}
    bookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0]
      if (!trends[date]) {
        trends[date] = {
          date,
          bookings: 0,
          revenue: 0,
          confirmed: 0,
          cancelled: 0
        }
      }
      trends[date].bookings++
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        trends[date].revenue += booking.totalPrice
        trends[date].confirmed++
      } else if (booking.status === 'CANCELLED') {
        trends[date].cancelled++
      }
    })

    return Object.values(trends)
  } catch (error) {
    console.error('Error fetching booking trends:', error)
    throw new Error('Failed to fetch booking trends')
  }
}

export async function getSportPopularity(facilityId = null) {
  try {
    const where = facilityId ? { facilityId } : {}

    const bookings = await db.booking.findMany({
      where,
      include: {
        court: {
          select: {
            sportType: true
          }
        }
      }
    })

    const sportStats = {}
    bookings.forEach(booking => {
      const sport = booking.court.sportType
      if (!sportStats[sport]) {
        sportStats[sport] = {
          sport,
          bookings: 0,
          revenue: 0
        }
      }
      sportStats[sport].bookings++
      if (booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') {
        sportStats[sport].revenue += booking.totalPrice
      }
    })

    return Object.values(sportStats).sort((a, b) => b.bookings - a.bookings)
  } catch (error) {
    console.error('Error fetching sport popularity:', error)
    throw new Error('Failed to fetch sport popularity')
  }
}

export async function getPeakHours(facilityId = null) {
  try {
    const where = facilityId ? { facilityId } : {}

    const bookings = await db.booking.findMany({
      where: {
        ...where,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        startTime: true
      }
    })

    const hourStats = {}
    for (let hour = 0; hour < 24; hour++) {
      hourStats[hour] = 0
    }

    bookings.forEach(booking => {
      const hour = parseInt(booking.startTime.split(':')[0])
      hourStats[hour]++
    })

    return Object.entries(hourStats).map(([hour, count]) => ({
      hour: parseInt(hour),
      timeLabel: `${hour.padStart(2, '0')}:00`,
      bookings: count
    }))
  } catch (error) {
    console.error('Error fetching peak hours:', error)
    throw new Error('Failed to fetch peak hours')
  }
}

export async function getUserRegistrationTrends(period = '30d') {
  try {
    let startDate

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const users = await db.user.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        role: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const trends = {}
    users.forEach(user => {
      const date = user.createdAt.toISOString().split('T')[0]
      if (!trends[date]) {
        trends[date] = {
          date,
          users: 0,
          facilityOwners: 0,
          total: 0
        }
      }
      trends[date].total++
      if (user.role === 'FACILITY_OWNER') {
        trends[date].facilityOwners++
      } else {
        trends[date].users++
      }
    })

    return Object.values(trends)
  } catch (error) {
    console.error('Error fetching user registration trends:', error)
    throw new Error('Failed to fetch user registration trends')
  }
}

export async function getFacilityApprovalTrends(period = '30d') {
  try {
    let startDate

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const facilities = await db.facility.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        createdAt: true,
        status: true
      },
      orderBy: { createdAt: 'asc' }
    })

    const trends = {}
    facilities.forEach(facility => {
      const date = facility.createdAt.toISOString().split('T')[0]
      if (!trends[date]) {
        trends[date] = {
          date,
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0
        }
      }
      trends[date].total++
      trends[date][facility.status.toLowerCase()]++
    })

    return Object.values(trends)
  } catch (error) {
    console.error('Error fetching facility approval trends:', error)
    throw new Error('Failed to fetch facility approval trends')
  }
}

export async function getRevenueAnalytics(facilityId = null, period = '30d') {
  try {
    const where = facilityId ? { facilityId } : {}
    let startDate

    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }

    const bookings = await db.booking.findMany({
      where: {
        ...where,
        createdAt: { gte: startDate },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        createdAt: true,
        totalPrice: true,
        bookingDate: true,
        court: {
          select: {
            sportType: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const revenueByDate = {}
    const revenueBySport = {}

    bookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0]
      const sport = booking.court.sportType

      // Revenue by date
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          date,
          revenue: 0,
          bookings: 0
        }
      }
      revenueByDate[date].revenue += booking.totalPrice
      revenueByDate[date].bookings++

      // Revenue by sport
      if (!revenueBySport[sport]) {
        revenueBySport[sport] = {
          sport,
          revenue: 0,
          bookings: 0
        }
      }
      revenueBySport[sport].revenue += booking.totalPrice
      revenueBySport[sport].bookings++
    })

    return {
      revenueByDate: Object.values(revenueByDate),
      revenueBySport: Object.values(revenueBySport).sort((a, b) => b.revenue - a.revenue)
    }
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    throw new Error('Failed to fetch revenue analytics')
  }
}

export async function updateDailyAnalytics() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if analytics already exist for today
    const existingAnalytics = await db.analytics.findUnique({
      where: { date: today }
    })

    if (existingAnalytics) {
      return existingAnalytics
    }

    // Calculate stats for today
    const [
      totalBookings,
      totalRevenue,
      newUsers,
      activeFacilities,
      sportStats,
      hourlyStats
    ] = await Promise.all([
      db.booking.count({
        where: {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.booking.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        },
        _sum: { totalPrice: true }
      }),
      db.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      }),
      db.facility.count({
        where: {
          status: 'APPROVED',
          isActive: true
        }
      }),
      getSportPopularity(),
      getPeakHours()
    ])

    const analytics = await db.analytics.create({
      data: {
        date: today,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        newUsers,
        activeFacilities,
        popularSports: JSON.stringify(sportStats.slice(0, 5)),
        peakHours: JSON.stringify(hourlyStats.filter(h => h.bookings > 0))
      }
    })

    return analytics
  } catch (error) {
    console.error('Error updating daily analytics:', error)
    throw new Error('Failed to update daily analytics')
  }
}
