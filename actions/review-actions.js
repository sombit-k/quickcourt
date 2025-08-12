"use server"

import { auth } from '@clerk/nextjs/server'
import {db as prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Create a new review
export async function createReview(facilityId, rating, comment, isAnonymous = false) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return { 
        success: false, 
        error: 'You must be logged in to write a review' 
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    // Check if user has a completed booking at this facility
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        facilityId: facilityId,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        bookingDate: {
          lt: new Date() // Past bookings only
        }
      }
    })

    if (!hasBooking) {
      return { 
        success: false, 
        error: 'You can only review facilities where you have completed a booking' 
      }
    }

    // Check if user has already reviewed this facility
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        facilityId: facilityId
      }
    })

    if (existingReview) {
      return { 
        success: false, 
        error: 'You have already reviewed this facility' 
      }
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { 
        success: false, 
        error: 'Rating must be between 1 and 5 stars' 
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        facilityId: facilityId,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        isAnonymous: Boolean(isAnonymous)
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
            avatar: true
          }
        }
      }
    })

    // Update facility's average rating and review count
    await updateFacilityRating(facilityId)

    // Revalidate relevant pages
    revalidatePath(`/venue/${facilityId}`)
    revalidatePath(`/book/${facilityId}`)
    revalidatePath('/venue')

    return { 
      success: true, 
      review: review,
      message: 'Review submitted successfully!' 
    }

  } catch (error) {
    console.error('Error creating review:', error)
    return { 
      success: false, 
      error: 'Failed to submit review. Please try again.' 
    }
  }
}

// Update a review
export async function updateReview(reviewId, rating, comment, isAnonymous = false) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return { 
        success: false, 
        error: 'You must be logged in to update a review' 
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    // Get the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return { 
        success: false, 
        error: 'Review not found' 
      }
    }

    // Check if user owns this review
    if (existingReview.userId !== user.id) {
      return { 
        success: false, 
        error: 'You can only update your own reviews' 
      }
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return { 
        success: false, 
        error: 'Rating must be between 1 and 5 stars' 
      }
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        isAnonymous: Boolean(isAnonymous)
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            fullName: true,
            avatar: true
          }
        }
      }
    })

    // Update facility's average rating
    await updateFacilityRating(existingReview.facilityId)

    // Revalidate relevant pages
    revalidatePath(`/venue/${existingReview.facilityId}`)
    revalidatePath(`/book/${existingReview.facilityId}`)
    revalidatePath('/venue')

    return { 
      success: true, 
      review: updatedReview,
      message: 'Review updated successfully!' 
    }

  } catch (error) {
    console.error('Error updating review:', error)
    return { 
      success: false, 
      error: 'Failed to update review. Please try again.' 
    }
  }
}

// Delete a review
export async function deleteReview(reviewId) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return { 
        success: false, 
        error: 'You must be logged in to delete a review' 
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    // Get the existing review
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    })

    if (!existingReview) {
      return { 
        success: false, 
        error: 'Review not found' 
      }
    }

    // Check if user owns this review or is an admin
    if (existingReview.userId !== user.id && user.role !== 'ADMIN') {
      return { 
        success: false, 
        error: 'You can only delete your own reviews' 
      }
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Update facility's average rating
    await updateFacilityRating(existingReview.facilityId)

    // Revalidate relevant pages
    revalidatePath(`/venue/${existingReview.facilityId}`)
    revalidatePath(`/book/${existingReview.facilityId}`)
    revalidatePath('/venue')

    return { 
      success: true, 
      message: 'Review deleted successfully!' 
    }

  } catch (error) {
    console.error('Error deleting review:', error)
    return { 
      success: false, 
      error: 'Failed to delete review. Please try again.' 
    }
  }
}

// Get reviews for a facility
export async function getFacilityReviews(facilityId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { facilityId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              fullName: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: { facilityId }
      })
    ])

    return {
      success: true,
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: skip + reviews.length < totalCount
      }
    }

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return {
      success: false,
      error: 'Failed to fetch reviews'
    }
  }
}

// Check if user can review a facility
export async function canUserReview(facilityId) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return { 
        canReview: false, 
        reason: 'You must be logged in to review facilities' 
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    })

    if (!user) {
      return { 
        canReview: false, 
        reason: 'User not found' 
      }
    }

    // Check if user has completed booking at this facility
    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        facilityId: facilityId,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        bookingDate: {
          lt: new Date() // Past bookings only
        }
      }
    })

    if (!hasBooking) {
      return { 
        canReview: false, 
        reason: 'You can only review facilities where you have completed a booking' 
      }
    }

    // Check if user has already reviewed this facility
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        facilityId: facilityId
      }
    })

    if (existingReview) {
      return { 
        canReview: false, 
        reason: 'You have already reviewed this facility',
        existingReview: existingReview
      }
    }

    return { 
      canReview: true, 
      userId: user.id 
    }

  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return { 
      canReview: false, 
      reason: 'Failed to check review eligibility' 
    }
  }
}

// Helper function to update facility rating
async function updateFacilityRating(facilityId) {
  try {
    // Get all reviews for this facility
    const reviews = await prisma.review.findMany({
      where: { facilityId },
      select: { rating: true }
    })

    if (reviews.length === 0) {
      // No reviews, set rating to 0
      await prisma.facility.update({
        where: { id: facilityId },
        data: {
          rating: 0,
          totalReviews: 0
        }
      })
    } else {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / reviews.length

      await prisma.facility.update({
        where: { id: facilityId },
        data: {
          rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          totalReviews: reviews.length
        }
      })
    }
  } catch (error) {
    console.error('Error updating facility rating:', error)
  }
}
