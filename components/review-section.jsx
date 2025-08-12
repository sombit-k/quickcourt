"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Calendar,
  Loader2
} from 'lucide-react'
import {
  createReview,
  updateReview,
  deleteReview,
  getFacilityReviews,
  canUserReview
} from '@/actions/review-actions'

const ReviewSection = ({ facilityId, facilityName }) => {
  const { user: clerkUser, isLoaded } = useUser()
  const [reviews, setReviews] = useState([])
  const [canReview, setCanReview] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    isAnonymous: false
  })

  // Load reviews and check review eligibility
  useEffect(() => {
    if (isLoaded && facilityId) {
      loadReviews()
      checkReviewEligibility()
    }
  }, [isLoaded, facilityId])

  const loadReviews = async () => {
    try {
      const result = await getFacilityReviews(facilityId, 1, 20)
      if (result.success) {
        setReviews(result.reviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkReviewEligibility = async () => {
    if (!clerkUser) return
    
    try {
      const result = await canUserReview(facilityId)
      setCanReview(result.canReview)
      if (result.existingReview) {
        setUserReview(result.existingReview)
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      let result
      if (editingReview) {
        result = await updateReview(
          editingReview.id,
          reviewForm.rating,
          reviewForm.comment,
          reviewForm.isAnonymous
        )
      } else {
        result = await createReview(
          facilityId,
          reviewForm.rating,
          reviewForm.comment,
          reviewForm.isAnonymous
        )
      }

      if (result.success) {
        toast.success(result.message)
        setShowReviewForm(false)
        setEditingReview(null)
        setReviewForm({ rating: 5, comment: '', isAnonymous: false })
        loadReviews()
        checkReviewEligibility()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
    setReviewForm({
      rating: review.rating,
      comment: review.comment || '',
      isAnonymous: review.isAnonymous
    })
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const result = await deleteReview(reviewId)
      if (result.success) {
        toast.success(result.message)
        loadReviews()
        checkReviewEligibility()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading reviews...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews ({reviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Review Action Buttons */}
          {clerkUser && (
            <div className="mb-4">
              {canReview && !showReviewForm && (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="mr-2"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              )}
              
              {userReview && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditReview(userReview)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit My Review
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteReview(userReview.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Review
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingReview ? 'Edit Your Review' : `Write a Review for ${facilityName}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating */}
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="mt-1">
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <Label htmlFor="comment" className="text-sm font-medium">
                      Comment (Optional)
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="Share your experience with this facility..."
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ 
                        ...prev, 
                        comment: e.target.value 
                      }))}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={reviewForm.isAnonymous}
                      onChange={(e) => setReviewForm(prev => ({ 
                        ...prev, 
                        isAnonymous: e.target.checked 
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Post anonymously
                    </Label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingReview ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          {editingReview ? 'Update Review' : 'Submit Review'}
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false)
                        setEditingReview(null)
                        setReviewForm({ rating: 5, comment: '', isAnonymous: false })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {review.isAnonymous ? (
                        <User className="w-5 h-5 text-blue-600" />
                      ) : (
                        <span className="text-sm font-medium text-blue-600">
                          {review.user.firstName?.[0] || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {review.isAnonymous ? 'Anonymous User' : review.user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <Badge variant="secondary">
                      {review.rating}/5
                    </Badge>
                  </div>
                </div>

                {review.comment && (
                  <div className="mt-3">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No reviews yet</p>
            <p className="text-sm text-gray-400">
              Be the first to share your experience with this facility!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReviewSection
