'use server'

import { db } from '@/lib/prisma'

export async function createReview(reviewData) {
  try {
    // Check if user has already reviewed this facility
    const existingReview = await db.review.findUnique({
      where: {
        userId_facilityId: {
          userId: reviewData.userId,
          facilityId: reviewData.facilityId
        }
      }
    })

    if (existingReview) {
      throw new Error('You have already reviewed this facility')
    }

    // Check if user has actually used this facility
    const hasBooking = await db.booking.findFirst({
      where: {
        userId: reviewData.userId,
        facilityId: reviewData.facilityId,
        status: 'COMPLETED'
      }
    })

    if (!hasBooking) {
      throw new Error('You can only review facilities you have used')
    }

    const review = await db.review.create({
      data: {
        userId: reviewData.userId,
        facilityId: reviewData.facilityId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isAnonymous: reviewData.isAnonymous || false
      }
    })

    // Update facility rating
    await updateFacilityRating(reviewData.facilityId)

    return review
  } catch (error) {
    console.error('Error creating review:', error)
    throw new Error(error.message || 'Failed to create review')
  }
}

export async function updateReview(reviewId, userId, reviewData) {
  try {
    const review = await db.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId !== userId) {
      throw new Error('You can only update your own reviews')
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: {
        rating: reviewData.rating,
        comment: reviewData.comment,
        isAnonymous: reviewData.isAnonymous
      }
    })

    // Update facility rating
    await updateFacilityRating(review.facilityId)

    return updatedReview
  } catch (error) {
    console.error('Error updating review:', error)
    throw new Error(error.message || 'Failed to update review')
  }
}

export async function deleteReview(reviewId, userId) {
  try {
    const review = await db.review.findUnique({
      where: { id: reviewId }
    })

    if (!review) {
      throw new Error('Review not found')
    }

    if (review.userId !== userId) {
      throw new Error('You can only delete your own reviews')
    }

    await db.review.delete({
      where: { id: reviewId }
    })

    // Update facility rating
    await updateFacilityRating(review.facilityId)

    return { success: true }
  } catch (error) {
    console.error('Error deleting review:', error)
    throw new Error(error.message || 'Failed to delete review')
  }
}

export async function getFacilityReviews(facilityId, page = 1, limit = 10) {
  try {
    const offset = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { facilityId },
        skip: offset,
        take: limit,
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
      }),
      db.review.count({ where: { facilityId } })
    ])

    return {
      reviews,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching facility reviews:', error)
    throw new Error('Failed to fetch reviews')
  }
}

export async function getUserReviews(userId) {
  try {
    const reviews = await db.review.findMany({
      where: { userId },
      include: {
        facility: {
          select: {
            name: true,
            images: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return reviews
  } catch (error) {
    console.error('Error fetching user reviews:', error)
    throw new Error('Failed to fetch user reviews')
  }
}

async function updateFacilityRating(facilityId) {
  try {
    const reviews = await db.review.findMany({
      where: { facilityId },
      select: { rating: true }
    })

    if (reviews.length === 0) {
      await db.facility.update({
        where: { id: facilityId },
        data: {
          rating: 0,
          totalReviews: 0
        }
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await db.facility.update({
      where: { id: facilityId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length
      }
    })
  } catch (error) {
    console.error('Error updating facility rating:', error)
  }
}

export async function getReviewStats(facilityId) {
  try {
    const stats = await db.review.groupBy({
      by: ['rating'],
      where: { facilityId },
      _count: { rating: true }
    })

    const ratingBreakdown = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }

    stats.forEach(stat => {
      ratingBreakdown[stat.rating] = stat._count.rating
    })

    const totalReviews = Object.values(ratingBreakdown).reduce((sum, count) => sum + count, 0)
    const averageRating = totalReviews > 0 ? 
      Object.entries(ratingBreakdown).reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0) / totalReviews : 0

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingBreakdown
    }
  } catch (error) {
    console.error('Error fetching review stats:', error)
    throw new Error('Failed to fetch review statistics')
  }
}
