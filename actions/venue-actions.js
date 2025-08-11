'use server'

import { db } from '@/lib/prisma'

export async function getAllVenues(sortBy = 'rating') {
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
      }
    })

    // Transform the data to match the frontend format
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

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        transformedVenues.sort((a, b) => a.minPrice - b.minPrice)
        break
      case 'price-high':
        transformedVenues.sort((a, b) => b.minPrice - a.minPrice)
        break
      case 'rating':
        transformedVenues.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        transformedVenues.sort((a, b) => b.totalReviews - a.totalReviews)
        break
      case 'name':
        transformedVenues.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        transformedVenues.sort((a, b) => b.rating - a.rating)
    }

    return transformedVenues
  } catch (error) {
    console.error('Error fetching venues:', error)
    throw new Error('Failed to fetch venues')
  }
}

export async function searchVenues(filters) {
  try {
    console.log('Search filters received:', filters)

    // Start with simple query first
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
        reviews: true,
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    console.log('Database query successful, found venues:', venues.length)

    // Apply simple filtering after fetching
    let filteredVenues = venues

    const {
      searchQuery = '',
      location = '',
      sports = [],
      venueType = '',
      priceRange = '',
      sortBy = 'rating'
    } = filters

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredVenues = filteredVenues.filter(venue => 
        venue.name.toLowerCase().includes(query) || 
        (venue.description && venue.description.toLowerCase().includes(query))
      )
    }

    // Filter by location
    if (location && location.trim()) {
      const loc = location.toLowerCase()
      filteredVenues = filteredVenues.filter(venue =>
        venue.city.toLowerCase().includes(loc) ||
        venue.state.toLowerCase().includes(loc) ||
        (venue.address && venue.address.toLowerCase().includes(loc))
      )
    }

    // Filter by sports
    if (sports && sports.length > 0) {
      filteredVenues = filteredVenues.filter(venue =>
        venue.courts.some(court => sports.includes(court.sportType))
      )
    }

    console.log('After filtering:', filteredVenues.length)

    // Transform the data
    let transformedVenues = filteredVenues.map(venue => {
      try {
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
            userName: review.isAnonymous ? 'Anonymous' : `${review.user?.firstName || 'Unknown'} ${review.user?.lastName || ''}`,
            createdAt: review.createdAt
          }))
        }
      } catch (transformError) {
        console.error('Error transforming venue:', venue.id, transformError)
        // Return a basic venue object if transformation fails
        return {
          id: venue.id,
          name: venue.name,
          description: venue.description || '',
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
          sportsTypes: [],
          amenities: [],
          images: [],
          operatingHours: {},
          courts: venue.courts || [],
          minPrice: 0,
          maxPrice: 0,
          owner: venue.owner,
          reviewsData: []
        }
      }
    })

    console.log('Venue transformation successful, applying sorting and price filter...')

    // Apply price filter
    if (priceRange) {
      console.log('Applying price filter:', priceRange)
      if (priceRange.includes('+')) {
        const minPrice = parseInt(priceRange.split('+')[0])
        transformedVenues = transformedVenues.filter(venue => venue.minPrice >= minPrice)
      } else {
        const [minPrice, maxPrice] = priceRange.split('-').map(p => parseInt(p))
        transformedVenues = transformedVenues.filter(venue => 
          venue.minPrice >= minPrice && venue.minPrice <= maxPrice
        )
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        transformedVenues.sort((a, b) => a.minPrice - b.minPrice)
        break
      case 'price-high':
        transformedVenues.sort((a, b) => b.minPrice - a.minPrice)
        break
      case 'rating':
        transformedVenues.sort((a, b) => b.rating - a.rating)
        break
      case 'reviews':
        transformedVenues.sort((a, b) => b.totalReviews - a.totalReviews)
        break
      case 'name':
        transformedVenues.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        transformedVenues.sort((a, b) => b.rating - a.rating)
    }

    console.log('Final search results:', transformedVenues.length)
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

// export async function getVenueById(id) {
//   try {
//     const venue = await db.facility.findUnique({
//       where: {
//         id: id,
//         status: 'APPROVED',
//         isActive: true
//       },
//       include: {
//         courts: {
//           where: {
//             isActive: true
//           }
//         },
//         reviews: {
//           include: {
//             user: {
//               select: {
//                 firstName: true,
//                 lastName: true
//               }
//             }
//           },
//           orderBy: {
//             createdAt: 'desc'
//           }
//         },
//         owner: {
//           select: {
//             firstName: true,
//             lastName: true,
//             email: true,
//             phone: true
//           }
//         }
//       }
//     })

//     if (!venue) {
//       throw new Error('Venue not found')
//     }

//     // Transform the data to match the frontend format
//     const transformedVenue = {
//       id: venue.id,
//       name: venue.name,
//       description: venue.description,
//       location: `${venue.address}, ${venue.city}`,
//       city: venue.city,
//       state: venue.state,
//       address: venue.address,
//       zipCode: venue.zipCode,
//       phone: venue.phone,
//       email: venue.email,
//       website: venue.website,
//       rating: venue.rating || 0,
//       totalReviews: venue.totalReviews || 0,
//       sportsTypes: JSON.parse(venue.sportsTypes || '[]'),
//       amenities: JSON.parse(venue.amenities || '[]'),
//       images: JSON.parse(venue.images || '["https://via.placeholder.com/400x300"]'),
//       operatingHours: JSON.parse(venue.operatingHours || '{}'),
//       courts: venue.courts.map(court => ({
//         id: court.id,
//         name: court.name,
//         sportType: court.sportType,
//         pricePerHour: court.pricePerHour,
//         description: court.description,
//         images: JSON.parse(court.images || '[]'),
//         features: JSON.parse(court.features || '[]')
//       })),
//       minPrice: venue.courts.length > 0 
//         ? Math.min(...venue.courts.map(court => court.pricePerHour))
//         : 0,
//       maxPrice: venue.courts.length > 0 
//         ? Math.max(...venue.courts.map(court => court.pricePerHour))
//         : 0,
//       owner: venue.owner,
//       reviewsData: venue.reviews.map(review => ({
//         id: review.id,
//         rating: review.rating,
//         comment: review.comment,
//         userName: review.isAnonymous ? 'Anonymous' : `${review.user.firstName} ${review.user.lastName}`,
//         createdAt: review.createdAt
//       })),
//       bookingOptions: {
//         quickBook: true,
//         advanceBooking: 30,
//         cancellationPolicy: '24 hours before booking time'
//       }
//     }

//     return transformedVenue
//   } catch (error) {
//     console.error('Error fetching venue by ID:', error)
//     throw new Error('Failed to fetch venue details')
//   }
// }

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

export async function getTopRatedVenues(limit = 4) {
  try {
    const facilities = await db.facility.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        courts: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            pricePerHour: true,
            sportType: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: [
        {
          rating: 'desc'
        },
        {
          totalReviews: 'desc'
        }
      ],
      take: limit
    })

    // Transform the data for the frontend
    const transformedVenues = facilities.map((facility) => {
      // Get unique sport types
      const sportsTypes = [...new Set(facility.courts.map(court => court.sportType))]
      
      // Get the minimum price from all courts
      const minPrice = facility.courts.length > 0 
        ? Math.min(...facility.courts.map(court => court.pricePerHour))
        : 0

      // Get a court ID for booking (preferably the cheapest one)
      const bookingCourtId = facility.courts.length > 0 
        ? facility.courts.find(court => court.pricePerHour === minPrice)?.id
        : null

      // Parse sports types from JSON if it's a string
      let facilitySports = []
      try {
        facilitySports = JSON.parse(facility.sportsTypes || '[]')
      } catch {
        facilitySports = sportsTypes
      }

      // Generate a color based on the first sport type
      const getColorForSport = (sport) => {
        const colorMap = {
          'badminton': 'from-blue-600 to-purple-600',
          'tennis': 'from-green-500 to-teal-600',
          'basketball': 'from-orange-500 to-red-600',
          'football': 'from-purple-500 to-pink-600',
          'cricket': 'from-yellow-500 to-orange-600',
          'swimming': 'from-blue-400 to-blue-600',
          'table tennis': 'from-indigo-500 to-purple-600',
          'boxing': 'from-red-500 to-pink-500'
        }
        
        const sportKey = sport?.toLowerCase().replace(/\s+/g, ' ')
        return colorMap[sportKey] || 'from-gray-500 to-gray-600'
      }

      const primarySport = facilitySports[0] || sportsTypes[0] || 'Sports'
      
      return {
        id: facility.id,
        name: facility.name,
        rating: facility.rating || 0,
        reviews: facility._count.reviews,
        location: `${facility.city}, ${facility.state}`,
        address: facility.address,
        price: minPrice > 0 ? `₹${minPrice}/hr` : 'Contact for pricing',
        sports: facilitySports.length > 0 ? facilitySports : sportsTypes,
        color: getColorForSport(primarySport),
        bookingCourtId,
        description: facility.description,
        totalCourts: facility.courts.length
      }
    })

    return transformedVenues
  } catch (error) {
    console.error('Error fetching top rated venues:', error)
    return []
  }
}

export async function getFeaturedVenues() {
  try {
    // Get venues with at least some ratings and active courts
    const facilities = await db.facility.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        courts: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        courts: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            pricePerHour: true,
            sportType: true,
            name: true
          }
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      orderBy: [
        {
          rating: 'desc'
        },
        {
          totalReviews: 'desc'
        },
        {
          createdAt: 'desc'
        }
      ],
      take: 8
    })

    return facilities.map((facility) => {
      const sportsTypes = [...new Set(facility.courts.map(court => court.sportType))]
      const minPrice = facility.courts.length > 0 
        ? Math.min(...facility.courts.map(court => court.pricePerHour))
        : 0
      const bookingCourtId = facility.courts.length > 0 
        ? facility.courts.find(court => court.pricePerHour === minPrice)?.id
        : null

      let facilitySports = []
      try {
        facilitySports = JSON.parse(facility.sportsTypes || '[]')
      } catch {
        facilitySports = sportsTypes
      }

      return {
        id: facility.id,
        name: facility.name,
        rating: facility.rating || 0,
        reviews: facility._count.reviews,
        totalBookings: facility._count.bookings,
        location: `${facility.city}, ${facility.state}`,
        address: facility.address,
        price: minPrice > 0 ? `₹${minPrice}/hr` : 'Contact for pricing',
        sports: facilitySports.length > 0 ? facilitySports : sportsTypes,
        bookingCourtId,
        description: facility.description,
        totalCourts: facility.courts.length,
        courts: facility.courts
      }
    })
  } catch (error) {
    console.error('Error fetching featured venues:', error)
    return []
  }
}
