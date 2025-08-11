'use server'

import { db } from '@/lib/prisma'

export async function createFacility(facilityData) {
  try {
    const facility = await db.facility.create({
      data: {
        name: facilityData.name,
        description: facilityData.description,
        address: facilityData.address,
        city: facilityData.city,
        state: facilityData.state,
        zipCode: facilityData.zipCode,
        phone: facilityData.phone,
        email: facilityData.email,
        website: facilityData.website,
        sportsTypes: JSON.stringify(facilityData.sportsTypes || []),
        amenities: JSON.stringify(facilityData.amenities || []),
        images: JSON.stringify(facilityData.images || []),
        operatingHours: JSON.stringify(facilityData.operatingHours || {}),
        ownerId: facilityData.ownerId,
        status: 'PENDING'
      }
    })

    return facility
  } catch (error) {
    console.error('Error creating facility:', error)
    throw new Error('Failed to create facility')
  }
}

export async function updateFacility(facilityId, facilityData) {
  try {
    const facility = await db.facility.update({
      where: { id: facilityId },
      data: {
        name: facilityData.name,
        description: facilityData.description,
        address: facilityData.address,
        city: facilityData.city,
        state: facilityData.state,
        zipCode: facilityData.zipCode,
        phone: facilityData.phone,
        email: facilityData.email,
        website: facilityData.website,
        sportsTypes: JSON.stringify(facilityData.sportsTypes || []),
        amenities: JSON.stringify(facilityData.amenities || []),
        images: JSON.stringify(facilityData.images || []),
        operatingHours: JSON.stringify(facilityData.operatingHours || {})
      }
    })

    return facility
  } catch (error) {
    console.error('Error updating facility:', error)
    throw new Error('Failed to update facility')
  }
}

export async function getFacilities(page = 1, limit = 10, filters = {}) {
  try {
    const offset = (page - 1) * limit
    
    const where = {
      status: 'APPROVED',
      isActive: true
    }

    if (filters.sportType) {
      where.sportsTypes = {
        contains: filters.sportType
      }
    }

    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive'
      }
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [facilities, total] = await Promise.all([
      db.facility.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          courts: {
            where: { isActive: true }
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      db.facility.count({ where })
    ])

    return {
      facilities,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching facilities:', error)
    throw new Error('Failed to fetch facilities')
  }
}

export async function getFacilityById(facilityId) {
  try {
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        courts: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        bookings: {
          where: {
            status: 'CONFIRMED',
            bookingDate: {
              gte: new Date()
            }
          },
          select: {
            bookingDate: true,
            startTime: true,
            endTime: true,
            courtId: true
          }
        }
      }
    })

    return facility
  } catch (error) {
    console.error('Error fetching facility:', error)
    throw new Error('Failed to fetch facility')
  }
}

export async function getFacilitiesForOwner(ownerId) {
  try {
    const facilities = await db.facility.findMany({
      where: { ownerId },
      include: {
        courts: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return facilities
  } catch (error) {
    console.error('Error fetching owner facilities:', error)
    throw new Error('Failed to fetch facilities')
  }
}

export async function approveFacility(facilityId) {
  try {
    const facility = await db.facility.update({
      where: { id: facilityId },
      data: { status: 'APPROVED' }
    })

    return facility
  } catch (error) {
    console.error('Error approving facility:', error)
    throw new Error('Failed to approve facility')
  }
}

export async function rejectFacility(facilityId, reason) {
  try {
    const facility = await db.facility.update({
      where: { id: facilityId },
      data: { 
        status: 'REJECTED',
        rejectionReason: reason
      }
    })

    return facility
  } catch (error) {
    console.error('Error rejecting facility:', error)
    throw new Error('Failed to reject facility')
  }
}

export async function getPendingFacilities() {
  try {
    const facilities = await db.facility.findMany({
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
        courts: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return facilities
  } catch (error) {
    console.error('Error fetching pending facilities:', error)
    throw new Error('Failed to fetch pending facilities')
  }
}

export async function searchFacilities(query, filters = {}) {
  try {
    const where = {
      status: 'APPROVED',
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filters.sportType) {
      where.sportsTypes = {
        contains: filters.sportType
      }
    }

    if (filters.minPrice || filters.maxPrice) {
      where.courts = {
        some: {
          pricePerHour: {
            ...(filters.minPrice && { gte: filters.minPrice }),
            ...(filters.maxPrice && { lte: filters.maxPrice })
          }
        }
      }
    }

    const facilities = await db.facility.findMany({
      where,
      include: {
        courts: {
          where: { isActive: true }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { totalReviews: 'desc' }
      ]
    })

    return facilities
  } catch (error) {
    console.error('Error searching facilities:', error)
    throw new Error('Failed to search facilities')
  }
}
