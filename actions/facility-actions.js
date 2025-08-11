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
