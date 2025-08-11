'use server'

import { db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function createFacility(formData) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to create a facility' }
    }

    // Get user from database to check role
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You must be a facility owner to create venues' }
    }

    // Extract form data
    const facilityData = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      website: formData.get('website'),
      sportsTypes: formData.get('sportsTypes'), // JSON string
      amenities: formData.get('amenities'), // JSON string
      images: formData.get('images'), // JSON string
      operatingHours: formData.get('operatingHours'), // JSON string
      ownerId: dbUser.id
    }

    // Validation
    if (!facilityData.name || !facilityData.address || !facilityData.city || !facilityData.state) {
      return { success: false, message: 'Please fill in all required fields' }
    }

    // Create facility
    const facility = await db.facility.create({
      data: facilityData
    })

    // Parse courts data if provided
    const courtsData = formData.get('courts')
    if (courtsData) {
      const courts = JSON.parse(courtsData)
      
      // Create courts for the facility
      for (const court of courts) {
        await db.court.create({
          data: {
            name: court.name,
            sportType: court.sportType,
            pricePerHour: parseFloat(court.pricePerHour),
            description: court.description || '',
            images: JSON.stringify(court.images || []),
            facilityId: facility.id
          }
        })
      }
    }

    return { 
      success: true, 
      message: 'Facility created successfully! It will be reviewed by our team.',
      facilityId: facility.id 
    }

  } catch (error) {
    console.error('Error creating facility:', error)
    return { success: false, message: 'Failed to create facility. Please try again.' }
  }
}

export async function getFacilitiesByOwner() {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found')
    }

    const facilities = await db.facility.findMany({
      where: {
        ownerId: dbUser.id
      },
      include: {
        courts: true,
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
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return facilities
  } catch (error) {
    console.error('Error fetching owner facilities:', error)
    throw new Error('Failed to fetch facilities')
  }
}

export async function getFacilityById(facilityId) {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found')
    }

    const facility = await db.facility.findUnique({
      where: { 
        id: facilityId,
        ownerId: dbUser.id // Ensure user owns this facility
      },
      include: {
        courts: {
          orderBy: {
            createdAt: 'asc'
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
        _count: {
          select: {
            bookings: true
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

export async function updateFacility(facilityId, formData) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to update a facility' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      return { success: false, message: 'User not found' }
    }

    // Check if user owns this facility
    const facility = await db.facility.findUnique({
      where: { id: facilityId }
    })

    if (!facility || facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to update this facility' }
    }

    // Extract form data
    const updateData = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      website: formData.get('website'),
      sportsTypes: formData.get('sportsTypes'),
      amenities: formData.get('amenities'),
      images: formData.get('images'),
      operatingHours: formData.get('operatingHours')
    }

    // Update facility
    const updatedFacility = await db.facility.update({
      where: { id: facilityId },
      data: updateData
    })

    return { 
      success: true, 
      message: 'Facility updated successfully!',
      facility: updatedFacility 
    }

  } catch (error) {
    console.error('Error updating facility:', error)
    return { success: false, message: 'Failed to update facility. Please try again.' }
  }
}

export async function deleteFacility(facilityId) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to delete a facility' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You do not have permission to delete facilities' }
    }

    // Check if user owns this facility
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                bookingDate: {
                  gte: new Date()
                },
                status: {
                  in: ['CONFIRMED']
                }
              }
            }
          }
        }
      }
    })

    if (!facility) {
      return { success: false, message: 'Facility not found' }
    }

    if (facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to delete this facility' }
    }

    // Check for future bookings
    const futureBookings = facility.courts.reduce((total, court) => total + court.bookings.length, 0)
    
    if (futureBookings > 0) {
      return { 
        success: false, 
        message: `Cannot delete facility with ${futureBookings} future booking(s). Please cancel all future bookings first.` 
      }
    }

    // Delete facility (cascade will handle courts and other related data)
    await db.facility.delete({
      where: { id: facilityId }
    })

    return { 
      success: true, 
      message: 'Facility deleted successfully!' 
    }

  } catch (error) {
    console.error('Error deleting facility:', error)
    return { success: false, message: 'Failed to delete facility. Please try again.' }
  }
}

export async function deleteCourt(courtId) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to delete a court' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You do not have permission to delete courts' }
    }

    // Check if user owns this court's facility
    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: true,
        bookings: {
          where: {
            bookingDate: {
              gte: new Date()
            },
            status: {
              in: ['CONFIRMED']
            }
          }
        }
      }
    })

    if (!court) {
      return { success: false, message: 'Court not found' }
    }

    if (court.facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to delete this court' }
    }

    // Check for future bookings
    if (court.bookings.length > 0) {
      return { 
        success: false, 
        message: `Cannot delete court with ${court.bookings.length} future booking(s). Please cancel all future bookings first.` 
      }
    }

    // Delete court
    await db.court.delete({
      where: { id: courtId }
    })

    return { 
      success: true, 
      message: 'Court deleted successfully!' 
    }

  } catch (error) {
    console.error('Error deleting court:', error)
    return { success: false, message: 'Failed to delete court. Please try again.' }
  }
}

export async function updateCourtStatus(courtId, isActive) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to update court status' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You do not have permission to update court status' }
    }

    // Check if user owns this court's facility
    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: true
      }
    })

    if (!court) {
      return { success: false, message: 'Court not found' }
    }

    if (court.facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to update this court' }
    }

    // Update court status
    const updatedCourt = await db.court.update({
      where: { id: courtId },
      data: { isActive }
    })

    return { 
      success: true, 
      message: `Court ${isActive ? 'activated' : 'deactivated'} successfully!`,
      court: updatedCourt 
    }

  } catch (error) {
    console.error('Error updating court status:', error)
    return { success: false, message: 'Failed to update court status. Please try again.' }
  }
}

export async function getCourtById(courtId) {
  try {
    const user = await currentUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found')
    }

    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: {
          where: {
            ownerId: dbUser.id // Ensure user owns the facility
          }
        }
      }
    })

    if (!court || !court.facility) {
      return null
    }

    return court
  } catch (error) {
    console.error('Error fetching court:', error)
    throw new Error('Failed to fetch court')
  }
}

export async function updateCourt(courtId, formData) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to update a court' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You do not have permission to update courts' }
    }

    // Check if user owns this court's facility
    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        facility: true
      }
    })

    if (!court) {
      return { success: false, message: 'Court not found' }
    }

    if (court.facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to update this court' }
    }

    // Extract form data
    const updateData = {
      name: formData.get('name'),
      sportType: formData.get('sportType'),
      pricePerHour: parseFloat(formData.get('pricePerHour')),
      description: formData.get('description'),
      images: formData.get('images'),
      isActive: formData.get('isActive') === 'true'
    }

    // Validation
    if (!updateData.name || !updateData.sportType || !updateData.pricePerHour) {
      return { success: false, message: 'Please fill in all required fields' }
    }

    if (updateData.pricePerHour <= 0) {
      return { success: false, message: 'Price per hour must be greater than 0' }
    }

    // Update court
    const updatedCourt = await db.court.update({
      where: { id: courtId },
      data: updateData
    })

    return { 
      success: true, 
      message: 'Court updated successfully!',
      court: updatedCourt 
    }

  } catch (error) {
    console.error('Error updating court:', error)
    return { success: false, message: 'Failed to update court. Please try again.' }
  }
}

export async function createCourt(facilityId, formData) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { success: false, message: 'You must be logged in to create a court' }
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser || dbUser.role !== 'FACILITY_OWNER') {
      return { success: false, message: 'You do not have permission to create courts' }
    }

    // Check if user owns this facility
    const facility = await db.facility.findUnique({
      where: { id: facilityId }
    })

    if (!facility || facility.ownerId !== dbUser.id) {
      return { success: false, message: 'You do not have permission to add courts to this facility' }
    }

    // Extract form data
    const courtData = {
      name: formData.get('name'),
      sportType: formData.get('sportType'),
      pricePerHour: parseFloat(formData.get('pricePerHour')),
      description: formData.get('description') || '',
      images: formData.get('images') || '[]',
      isActive: formData.get('isActive') === 'true',
      facilityId: facilityId
    }

    // Validation
    if (!courtData.name || !courtData.sportType || !courtData.pricePerHour) {
      return { success: false, message: 'Please fill in all required fields' }
    }

    if (courtData.pricePerHour <= 0) {
      return { success: false, message: 'Price per hour must be greater than 0' }
    }

    // Create court
    const court = await db.court.create({
      data: courtData
    })

    return { 
      success: true, 
      message: 'Court created successfully!',
      court: court 
    }

  } catch (error) {
    console.error('Error creating court:', error)
    return { success: false, message: 'Failed to create court. Please try again.' }
  }
}
