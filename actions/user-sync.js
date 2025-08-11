'use server'

import { db } from '@/lib/prisma'

export async function syncUser(userData) {
  try {
    console.log('Syncing user:', userData)
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: userData.clerkId }
    })

    // Map role to enum value
    const mapRole = (role) => {
      if (!role) return 'USER'
      switch (role.toLowerCase()) {
        case 'player':
        case 'user':
          return 'USER'
        case 'facility_owner':
        case 'facility':
          return 'FACILITY_OWNER'
        case 'admin':
          return 'ADMIN'
        default:
          return 'USER'
      }
    }

    if (existingUser) {
      // Update existing user
      const updatedUser = await db.user.update({
        where: { clerkId: userData.clerkId },
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
          avatar: userData.avatar || userData.profileImage,
          lastLogin: new Date(),
          // Don't update role if it already exists (user choice should persist)
          ...(userData.role && !existingUser.role && { 
            role: mapRole(userData.role)
          })
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
          fullName: userData.fullName || `${userData.firstName} ${userData.lastName}`,
          avatar: userData.avatar || userData.profileImage,
          role: mapRole(userData.role),
          isVerified: true, // Since they completed Clerk signup
          lastLogin: new Date()
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
