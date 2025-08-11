'use server'

import { db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export async function updateUserProfile(formData) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName') 
    const phone = formData.get('phone')
    const email = formData.get('email')

    // Validation
    if (!firstName || firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters')
    }
    if (!lastName || lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters')
    }
    if (email && !email.includes('@')) {
      throw new Error('Please enter a valid email address')
    }
    if (phone && phone.length < 10) {
      throw new Error('Please enter a valid phone number')
    }

    // Update user in database
    const updatedUser = await db.user.upsert({
      where: { clerkId: user.id },
      update: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone?.trim() || null,
        email: email?.trim() || user.emailAddresses[0]?.emailAddress,
        updatedAt: new Date()
      },
      create: {
        clerkId: user.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone?.trim() || null,
        email: email?.trim() || user.emailAddresses[0]?.emailAddress,
        role: 'USER'
      }
    })

    return { 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      message: error.message || 'Failed to update profile' 
    }
  }
}

export async function getCurrentUserBookings() {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userBookings = await db.booking.findMany({
      where: {
        user: {
          clerkId: user.id
        }
      },
      include: {
        facility: true,
        court: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    })

    return {
      success: true,
      bookings: userBookings
    }
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    return {
      success: false,
      message: 'Failed to fetch bookings'
    }
  }
}

export async function getUserBookings(clerkId) {
  try {
    if (!clerkId) {
      throw new Error('User not authenticated')
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        bookings: {
          include: {
            court: {
              include: {
                facility: true
              }
            }
          },
          orderBy: {
            bookingDate: 'desc'
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user.bookings
  } catch (error) {
    console.error('Error fetching user bookings:', error)
    throw new Error('Failed to fetch bookings')
  }
}
