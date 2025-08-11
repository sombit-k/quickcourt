'use server'

import { db } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function getAdminStats() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Fetch comprehensive statistics
    const [
      totalUsers,
      totalFacilityOwners,
      totalAdmins,
      totalBookings,
      totalActiveCourts,
      totalFacilities,
      pendingFacilities,
      approvedFacilities,
      recentBookings,
      topFacilities,
      userStats,
      bookingStats
    ] = await Promise.all([
      // User statistics
      db.user.count(),
      
      db.user.count({
        where: { role: 'FACILITY_OWNER' }
      }),
      
      db.user.count({
        where: { role: 'ADMIN' }
      }),
      
      // Booking statistics
      db.booking.count(),
      
      // Court statistics
      db.court.count({
        where: {
          isActive: true,
          facility: {
            status: 'APPROVED'
          }
        }
      }),
      
      // Facility statistics
      db.facility.count(),
      
      db.facility.count({
        where: { status: 'PENDING' }
      }),
      
      db.facility.count({
        where: { status: 'APPROVED' }
      }),
      
      // Recent bookings (last 7 days)
      db.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top facilities by booking count
      db.facility.findMany({
        select: {
          id: true,
          name: true,
          city: true,
          _count: {
            select: {
              bookings: true
            }
          }
        },
        orderBy: {
          bookings: {
            _count: 'desc'
          }
        },
        take: 5,
        where: {
          status: 'APPROVED'
        }
      }),
      
      // User registration statistics (last 30 days)
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Booking statistics (last 30 days)
      db.booking.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Calculate additional metrics
    const regularUsers = totalUsers - totalFacilityOwners - totalAdmins
    const facilityApprovalRate = totalFacilities > 0 ? (approvedFacilities / totalFacilities) * 100 : 0

    return {
      success: true,
      data: {
        // Basic counts
        totalUsers,
        totalFacilityOwners,
        totalAdmins,
        regularUsers,
        totalBookings,
        totalActiveCourts,
        totalFacilities,
        
        // Facility stats
        pendingFacilities,
        approvedFacilities,
        facilityApprovalRate: Math.round(facilityApprovalRate * 100) / 100,
        
        // Recent activity
        recentBookings,
        newUsersLast30Days: userStats,
        bookingsLast30Days: bookingStats,
        
        // Top performers
        topFacilities: topFacilities.map(facility => ({
          name: facility.name,
          city: facility.city,
          bookingCount: facility._count.bookings
        })),
        
        // Growth metrics
        userGrowthRate: userStats > 0 ? ((userStats / totalUsers) * 100).toFixed(1) : '0',
        bookingGrowthRate: bookingStats > 0 ? ((bookingStats / totalBookings) * 100).toFixed(1) : '0'
      }
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getUserAnalytics() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Get user registration trends (last 12 months)
    const userTrends = await db.user.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return {
      success: true,
      data: {
        userTrends
      }
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getAllUsers(searchTerm = '', roleFilter = '', statusFilter = '', page = 1, limit = 10) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Build where clause for filtering
    const whereClause = {
      AND: []
    }

    // Search filter
    if (searchTerm) {
      whereClause.AND.push({
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      })
    }

    // Role filter
    if (roleFilter && roleFilter !== 'ALL') {
      whereClause.AND.push({
        role: roleFilter
      })
    }

    // Status filter
    if (statusFilter && statusFilter !== 'ALL') {
      const isBanned = statusFilter === 'INACTIVE'
      whereClause.AND.push({
        isBanned: isBanned
      })
    }

    const skip = (page - 1) * limit

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where: whereClause.AND.length > 0 ? whereClause : undefined,
        select: {
          id: true,
          clerkId: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              bookings: true,
              facilities: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.user.count({
        where: whereClause.AND.length > 0 ? whereClause : undefined
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function toggleUserStatus(targetUserId, newStatus) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Prevent admin from deactivating themselves
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { clerkId: true, role: true, firstName: true, lastName: true }
    })

    if (!targetUser) {
      throw new Error('User not found')
    }

    if (targetUser.clerkId === userId) {
      throw new Error('Cannot modify your own account status')
    }

    // Prevent deactivating other admins
    if (targetUser.role === 'ADMIN' && newStatus) {
      throw new Error('Cannot ban other administrators')
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { isBanned: !newStatus },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isBanned: true
      }
    })

    return {
      success: true,
      data: updatedUser,
      message: `User ${!newStatus ? 'banned' : 'unbanned'} successfully`
    }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getUserBookingHistory(targetUserId, page = 1, limit = 10) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    const skip = (page - 1) * limit

    const [bookings, totalCount, userInfo] = await Promise.all([
      db.booking.findMany({
        where: { userId: targetUserId },
        include: {
          court: {
            include: {
              facility: {
                select: {
                  name: true,
                  city: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.booking.count({
        where: { userId: targetUserId }
      }),
      db.user.findUnique({
        where: { id: targetUserId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      })
    ])

    if (!userInfo) {
      throw new Error('User not found')
    }

    // Transform bookings to match the expected format in the UI
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      date: booking.bookingDate, // Map bookingDate to date
      timeSlot: `${booking.startTime} - ${booking.endTime}`, // Create timeSlot from start and end times
      status: booking.status,
      totalAmount: booking.totalPrice, // Map totalPrice to totalAmount
      createdAt: booking.createdAt,
      court: {
        name: booking.court.name,
        sportType: booking.court.sportType,
        facility: {
          name: booking.court.facility.name,
          city: booking.court.facility.city
        }
      }
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      data: {
        user: userInfo,
        bookings: transformedBookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user booking history:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function getPendingFacilities(page = 1, limit = 10) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    const skip = (page - 1) * limit

    const [facilities, totalCount] = await Promise.all([
      db.facility.findMany({
        where: { status: 'PENDING' },
        include: {
          owner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          courts: {
            select: {
              name: true,
              sportType: true,
              pricePerHour: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.facility.count({
        where: { status: 'PENDING' }
      })
    ])

    // Transform facilities data for display
    const transformedFacilities = facilities.map(facility => ({
      id: facility.id,
      name: facility.name,
      description: facility.description,
      address: facility.address,
      city: facility.city,
      state: facility.state,
      zipCode: facility.zipCode,
      phone: facility.phone,
      email: facility.email,
      website: facility.website,
      sportsTypes: (() => {
        try {
          return JSON.parse(facility.sportsTypes || '[]')
        } catch (e) {
          return []
        }
      })(),
      amenities: (() => {
        try {
          return JSON.parse(facility.amenities || '[]')
        } catch (e) {
          return []
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(facility.images || '[]')
        } catch (e) {
          return []
        }
      })(),
      operatingHours: (() => {
        try {
          return JSON.parse(facility.operatingHours || '{}')
        } catch (e) {
          return {}
        }
      })(),
      status: facility.status,
      createdAt: facility.createdAt,
      updatedAt: facility.updatedAt,
      owner: facility.owner,
      courts: facility.courts
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return {
      success: true,
      data: {
        facilities: transformedFacilities,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }
  } catch (error) {
    console.error('Error fetching pending facilities:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function approveFacility(facilityId, adminComments = '') {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Check if facility exists and is pending
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      select: { status: true, name: true }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    if (facility.status !== 'PENDING') {
      throw new Error('Facility is not in pending status')
    }

    // Update facility status to approved
    const updatedFacility = await db.facility.update({
      where: { id: facilityId },
      data: { 
        status: 'APPROVED',
        rejectionReason: null // Clear any previous rejection reason
      },
      include: {
        owner: {
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
      data: updatedFacility,
      message: `Facility "${facility.name}" has been approved successfully`
    }
  } catch (error) {
    console.error('Error approving facility:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

export async function rejectFacility(facilityId, rejectionReason) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is required')
    }

    // Check if facility exists and is pending
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      select: { status: true, name: true }
    })

    if (!facility) {
      throw new Error('Facility not found')
    }

    if (facility.status !== 'PENDING') {
      throw new Error('Facility is not in pending status')
    }

    // Update facility status to rejected with reason
    const updatedFacility = await db.facility.update({
      where: { id: facilityId },
      data: { 
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      },
      include: {
        owner: {
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
      data: updatedFacility,
      message: `Facility "${facility.name}" has been rejected`
    }
  } catch (error) {
    console.error('Error rejecting facility:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
