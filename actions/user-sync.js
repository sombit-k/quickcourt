'use server'

import { db } from '@/lib/prisma'

export async function syncUser(userData) {
  try {
    console.log('Syncing user:', userData)
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: userData.clerkId }
    })

    if (existingUser) {
      // Update existing user
      const updatedUser = await db.user.update({
        where: { clerkId: userData.clerkId },
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: userData.profileImage,
          // Don't update role if it already exists (user choice should persist)
          ...(userData.role && !existingUser.role && { role: userData.role })
        }
      })
      
      console.log('User updated:', updatedUser)
      return updatedUser
    } else {
      // Create new user
      const newUser = await db.user.create({
        data: {
          clerkId: userData.clerkId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImage: userData.profileImage,
          role: userData.role || 'player' // Default to player if no role specified
        }
      })
      
      console.log('User created:', newUser)
      return newUser
    }
  } catch (error) {
    console.error('Error syncing user:', error)
    throw new Error('Failed to sync user data')
  }
}

export async function getUserByClerkId(clerkId) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        bookings: {
          include: {
            facility: true,
            court: true
          }
        },
        facilities: {
          include: {
            courts: true
          }
        }
      }
    })
    
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user data')
  }
}
