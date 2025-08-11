'use server'

import { db } from '@/lib/prisma'

// Utility function to validate and normalize user data
function validateAndNormalizeUserData(userData) {
  const errors = []
  
  if (!userData?.clerkId) {
    errors.push('ClerkId is required')
  }
  
  if (!userData?.email) {
    errors.push('Email is required')
  }
  
  const firstName = userData?.firstName || userData?.username || 'User'
  const lastName = userData?.lastName || ''
  
  if (!firstName.trim()) {
    errors.push('First name cannot be empty')
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
  
  return {
    clerkId: userData.clerkId,
    email: userData.email,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    fullName: userData.fullName || `${firstName.trim()} ${lastName.trim()}`.trim(),
    avatar: userData.avatar || userData.profileImage || null,
    role: userData.role || 'USER'
  }
}

export async function syncUser(userInput) {
  try {
    console.log('Syncing user:', userInput)
    
    // Simple validation
    if (!userInput?.clerkId || !userInput?.email) {
      throw new Error('Missing required user data')
    }
    
    // Clean the data
    const cleanData = {
      clerkId: userInput.clerkId,
      email: userInput.email,
      firstName: userInput.firstName || 'User',
      lastName: userInput.lastName || '',
      fullName: userInput.fullName || `${userInput.firstName || 'User'} ${userInput.lastName || ''}`.trim(),
      avatar: userInput.avatar || userInput.profileImage || null,
      role: userInput.role || 'USER'
    }

    // Map role to enum
    const roleMap = {
      'player': 'USER',
      'user': 'USER',
      'facility_owner': 'FACILITY_OWNER',
      'facility': 'FACILITY_OWNER',
      'admin': 'ADMIN'
    }
    const mappedRole = roleMap[cleanData.role?.toLowerCase()] || 'USER'

    // Check if user exists by clerkId OR email
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { clerkId: cleanData.clerkId },
          { email: cleanData.email }
        ]
      }
    })

    //database error was fixed here
    if (existingUser) {
      const updatedUser = await db.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId: cleanData.clerkId,
          email: cleanData.email,
          firstName: cleanData.firstName,
          lastName: cleanData.lastName,
          fullName: cleanData.fullName,
          avatar: cleanData.avatar,
          lastLogin: new Date()
        }
      })
      console.log('User updated:', updatedUser.id)
      return updatedUser
    } else {
      // Create new user
      const newUser = await db.user.create({
        data: {
          clerkId: cleanData.clerkId,
          email: cleanData.email,
          firstName: cleanData.firstName,
          lastName: cleanData.lastName,
          fullName: cleanData.fullName,
          avatar: cleanData.avatar,
          role: mappedRole,
          isVerified: true,
          lastLogin: new Date()
        }
      })
      console.log('User created:', newUser.id)
      return newUser
    }
    
  } catch (error) {
    console.error('Error syncing user:', error.message)
    throw new Error(`User sync failed: ${error.message}`)
  }
}

export async function getUserByClerkId(clerkId) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      include: {
        bookings: {
          include: {
            facility: {
              include: {
                courts: true
              }
            },
            court: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        facilities: {
          include: {
            courts: true,
            bookings: {
              include: {
                user: true,
                court: true
              }
            },
            reviews: {
              include: {
                user: true
              }
            }
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

export async function updateUserProfile(clerkId, userData) {
  try {
    const updatedUser = await db.user.update({
      where: { clerkId },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
        phone: userData.phone,
        avatar: userData.avatar
      }
    })
    
    return updatedUser
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update user profile')
  }
}

export async function getAllUsers(page = 1, limit = 10, filters = {}) {
  try {
    const offset = (page - 1) * limit
    
    const where = {}
    if (filters.role) {
      where.role = filters.role
    }
    if (filters.isBanned !== undefined) {
      where.isBanned = filters.isBanned
    }
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              bookings: true,
              facilities: true
            }
          }
        }
      }),
      db.user.count({ where })
    ])

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function banUser(userId) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { isBanned: true }
    })
    
    return user
  } catch (error) {
    console.error('Error banning user:', error)
    throw new Error('Failed to ban user')
  }
}

export async function unbanUser(userId) {
  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { isBanned: false }
    })
    
    return user
  } catch (error) {
    console.error('Error unbanning user:', error)
    throw new Error('Failed to unban user')
  }
}

export async function getCurrentUser(clerkId) {
  try {
    if (!clerkId) {
      throw new Error('User not authenticated')
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        avatar: true,
        phone: true,
        role: true,
        createdAt: true,
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

    // If user doesn't exist in our database, return a minimal user object
    // This can happen if the user just signed up and hasn't been synced yet
    if (!user) {
      return {
        id: null,
        clerkId,
        email: null,
        firstName: null,
        lastName: null,
        fullName: null,
        avatar: null,
        phone: null,
        role: 'USER',
        createdAt: new Date(),
        bookings: []
      }
    }

    return user
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw new Error('Failed to fetch user profile')
  }
}
