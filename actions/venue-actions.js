'use server'

import { db } from '@/lib/prisma'

export async function getAllVenues() {
  try {
    const venues = await db.facility.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        courts: {
          where: {
            isActive: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    })

    // Transform the data to match the frontend format
    return venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      location: `${venue.address}, ${venue.city}`,
      city: venue.city,
      state: venue.state,
      address: venue.address,
      zipCode: venue.zipCode,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      rating: venue.rating || 0,
      reviews: venue.totalReviews || 0,
      totalReviews: venue.totalReviews || 0,
      sportsTypes: JSON.parse(venue.sportsTypes || '[]'),
      amenities: JSON.parse(venue.amenities || '[]'),
      images: JSON.parse(venue.images || '[]'),
      operatingHours: JSON.parse(venue.operatingHours || '{}'),
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        description: court.description,
        images: JSON.parse(court.images || '[]')
      })),
      minPrice: venue.courts.length > 0 
        ? Math.min(...venue.courts.map(court => court.pricePerHour))
        : 0,
      maxPrice: venue.courts.length > 0 
        ? Math.max(...venue.courts.map(court => court.pricePerHour))
        : 0,
      owner: venue.owner,
      reviewsData: venue.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.isAnonymous ? 'Anonymous' : `${review.user.firstName} ${review.user.lastName}`,
        createdAt: review.createdAt
      }))
    }))
  } catch (error) {
    console.error('Error fetching venues:', error)
    throw new Error('Failed to fetch venues')
  }
}

export async function searchVenues(filters) {
  try {
    const {
      searchQuery = '',
      location = '',
      sports = [],
      venueType = '',
      priceRange = '',
      sortBy = 'rating'
    } = filters

    // Build where clause
    const whereClause = {
      status: 'APPROVED',
      isActive: true,
      AND: []
    }

    // Search by name or description
    if (searchQuery) {
      whereClause.AND.push({
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } }
        ]
      })
    }

    // Filter by location
    if (location) {
      whereClause.AND.push({
        OR: [
          { city: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } }
        ]
      })
    }

    // Filter by sports types
    if (sports && sports.length > 0) {
      whereClause.AND.push({
        courts: {
          some: {
            sportType: {
              in: sports
            },
            isActive: true
          }
        }
      })
    }

    // Build order by clause
    let orderBy = { rating: 'desc' }
    switch (sortBy) {
      case 'price-low':
        orderBy = { courts: { _min: { pricePerHour: 'asc' } } }
        break
      case 'price-high':
        orderBy = { courts: { _max: { pricePerHour: 'desc' } } }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'reviews':
        orderBy = { totalReviews: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      default:
        orderBy = { rating: 'desc' }
    }

    const venues = await db.facility.findMany({
      where: whereClause,
      include: {
        courts: {
          where: {
            isActive: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy
    })

    // Transform and filter by price range if specified
    let transformedVenues = venues.map(venue => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      location: `${venue.address}, ${venue.city}`,
      city: venue.city,
      state: venue.state,
      address: venue.address,
      zipCode: venue.zipCode,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      rating: venue.rating || 0,
      reviews: venue.totalReviews || 0,
      totalReviews: venue.totalReviews || 0,
      sportsTypes: JSON.parse(venue.sportsTypes || '[]'),
      amenities: JSON.parse(venue.amenities || '[]'),
      images: JSON.parse(venue.images || '[]'),
      operatingHours: JSON.parse(venue.operatingHours || '{}'),
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        description: court.description,
        images: JSON.parse(court.images || '[]')
      })),
      minPrice: venue.courts.length > 0 
        ? Math.min(...venue.courts.map(court => court.pricePerHour))
        : 0,
      maxPrice: venue.courts.length > 0 
        ? Math.max(...venue.courts.map(court => court.pricePerHour))
        : 0,
      owner: venue.owner,
      reviewsData: venue.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.isAnonymous ? 'Anonymous' : `${review.user.firstName} ${review.user.lastName}`,
        createdAt: review.createdAt
      }))
    }))

    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-').map(p => 
        p.includes('+') ? Infinity : parseInt(p)
      )
      
      transformedVenues = transformedVenues.filter(venue => {
        const venueMinPrice = venue.minPrice
        return venueMinPrice >= minPrice && (maxPrice === Infinity || venueMinPrice <= maxPrice)
      })
    }

    return transformedVenues
  } catch (error) {
    console.error('Error searching venues:', error)
    throw new Error('Failed to search venues')
  }
}

export async function getVenueById(id) {
  try {
    const venue = await db.facility.findUnique({
      where: {
        id,
        status: 'APPROVED',
        isActive: true
      },
      include: {
        courts: {
          where: {
            isActive: true
          }
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
          orderBy: {
            createdAt: 'desc'
          }
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        bookings: {
          where: {
            bookingDate: {
              gte: new Date()
            },
            status: 'CONFIRMED'
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

    if (!venue) {
      throw new Error('Venue not found')
    }

    return {
      id: venue.id,
      name: venue.name,
      description: venue.description,
      location: `${venue.address}, ${venue.city}`,
      city: venue.city,
      state: venue.state,
      address: venue.address,
      zipCode: venue.zipCode,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      rating: venue.rating || 0,
      reviews: venue.totalReviews || 0,
      totalReviews: venue.totalReviews || 0,
      sportsTypes: JSON.parse(venue.sportsTypes || '[]'),
      amenities: JSON.parse(venue.amenities || '[]'),
      images: JSON.parse(venue.images || '[]'),
      operatingHours: JSON.parse(venue.operatingHours || '{}'),
      courts: venue.courts.map(court => ({
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        pricePerHour: court.pricePerHour,
        description: court.description,
        images: JSON.parse(court.images || '[]')
      })),
      minPrice: venue.courts.length > 0 
        ? Math.min(...venue.courts.map(court => court.pricePerHour))
        : 0,
      maxPrice: venue.courts.length > 0 
        ? Math.max(...venue.courts.map(court => court.pricePerHour))
        : 0,
      owner: venue.owner,
      reviewsData: venue.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: review.isAnonymous ? 'Anonymous' : `${review.user.firstName} ${review.user.lastName}`,
        userAvatar: review.user.avatar,
        createdAt: review.createdAt
      })),
      upcomingBookings: venue.bookings
    }
  } catch (error) {
    console.error('Error fetching venue:', error)
    throw new Error('Failed to fetch venue details')
  }
}

export async function getAvailableSports() {
  try {
    const courts = await db.court.findMany({
      where: {
        isActive: true,
        facility: {
          status: 'APPROVED',
          isActive: true
        }
      },
      select: {
        sportType: true
      },
      distinct: ['sportType']
    })

    return courts.map(court => court.sportType).sort()
  } catch (error) {
    console.error('Error fetching sports:', error)
    return []
  }
}

export async function getAvailableLocations() {
  try {
    const facilities = await db.facility.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      select: {
        city: true,
        state: true
      },
      distinct: ['city']
    })

    return facilities.map(facility => ({
      city: facility.city,
      state: facility.state,
      label: `${facility.city}, ${facility.state}`
    })).sort((a, b) => a.city.localeCompare(b.city))
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
}
