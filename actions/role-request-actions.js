'use server'

import { db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

// Submit a role request
export async function submitRoleRequest(requestedRole, reason) {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found in database')
    }

    // Check if user already has the requested role
    if (dbUser.role === requestedRole) {
      return {
        success: false,
        message: 'You already have this role'
      }
    }

    // Check if there's already a pending request for this role
    const existingRequest = await db.roleRequest.findFirst({
      where: {
        userId: dbUser.id,
        requestedRole: requestedRole,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return {
        success: false,
        message: 'You already have a pending request for this role'
      }
    }

    // Validate requested role (users cannot request ADMIN role)
    if (requestedRole === 'ADMIN') {
      return {
        success: false,
        message: 'Admin role cannot be requested'
      }
    }

    // Create the role request
    const roleRequest = await db.roleRequest.create({
      data: {
        userId: dbUser.id,
        requestedRole: requestedRole,
        reason: reason || '',
        status: 'PENDING'
      }
    })

    return {
      success: true,
      data: roleRequest,
      message: 'Role request submitted successfully. An admin will review your request.'
    }
  } catch (error) {
    console.error('Error submitting role request:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Get user's role requests
export async function getUserRoleRequests() {
  try {
    const user = await currentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    })

    if (!dbUser) {
      throw new Error('User not found in database')
    }

    const roleRequests = await db.roleRequest.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: roleRequests
    }
  } catch (error) {
    console.error('Error fetching role requests:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Admin functions
export async function getAllRoleRequests(page = 1, limit = 10, status = 'ALL') {
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
    const whereCondition = status !== 'ALL' ? { status } : {}

    const [roleRequests, totalCount] = await Promise.all([
      db.roleRequest.findMany({
        where: whereCondition,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.roleRequest.count({ where: whereCondition })
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      success: true,
      data: {
        roleRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext,
          hasPrev
        }
      }
    }
  } catch (error) {
    console.error('Error fetching role requests:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Approve role request
export async function approveRoleRequest(requestId, adminComments = '') {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    // Get the role request
    const roleRequest = await db.roleRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!roleRequest) {
      throw new Error('Role request not found')
    }

    if (roleRequest.status !== 'PENDING') {
      throw new Error('Role request is not in pending status')
    }

    // Update both the role request and the user's role
    await db.$transaction([
      // Update role request status
      db.roleRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminComments: adminComments,
          reviewedAt: new Date(),
          reviewedById: adminUser.id
        }
      }),
      // Update user's role
      db.user.update({
        where: { id: roleRequest.userId },
        data: {
          role: roleRequest.requestedRole
        }
      })
    ])

    return {
      success: true,
      message: `Role request approved. ${roleRequest.user.firstName} ${roleRequest.user.lastName} is now a ${roleRequest.requestedRole}.`
    }
  } catch (error) {
    console.error('Error approving role request:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Reject role request
export async function rejectRoleRequest(requestId, adminComments) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Verify user is admin
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      throw new Error('Forbidden - Admin access required')
    }

    if (!adminComments || !adminComments.trim()) {
      throw new Error('Admin comments are required for rejection')
    }

    // Get the role request
    const roleRequest = await db.roleRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!roleRequest) {
      throw new Error('Role request not found')
    }

    if (roleRequest.status !== 'PENDING') {
      throw new Error('Role request is not in pending status')
    }

    // Update role request status
    await db.roleRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminComments: adminComments.trim(),
        reviewedAt: new Date(),
        reviewedById: adminUser.id
      }
    })

    return {
      success: true,
      message: `Role request rejected for ${roleRequest.user.firstName} ${roleRequest.user.lastName}.`
    }
  } catch (error) {
    console.error('Error rejecting role request:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
