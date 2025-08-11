"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  Check, 
  X,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { getFacilitiesByOwner } from '@/actions/facility-actions'
import { getPendingBookingsForFacility, approveBooking, rejectBooking } from '@/actions/booking-actions'

const FacilityBookingsPage = () => {
  const [facilities, setFacilities] = useState([])
  const [selectedFacility, setSelectedFacility] = useState('')
  const [pendingBookings, setPendingBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingBooking, setProcessingBooking] = useState(null)
  const [error, setError] = useState(null)
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()

  // Fetch facilities owned by the user
  useEffect(() => {
    const fetchFacilities = async () => {
      if (isLoaded && clerkUser) {
        try {
          setLoading(true)
          const facilitiesData = await getFacilitiesByOwner()
          setFacilities(facilitiesData)
          
          // Auto-select first facility if available
          if (facilitiesData.length > 0) {
            setSelectedFacility(facilitiesData[0].id)
          }
        } catch (err) {
          console.error('Error fetching facilities:', err)
          setError('Failed to load facilities')
        } finally {
          setLoading(false)
        }
      } else if (isLoaded && !clerkUser) {
        router.push('/sign-in')
      }
    }

    fetchFacilities()
  }, [clerkUser, isLoaded, router])

  // Fetch pending bookings when facility changes
  useEffect(() => {
    const fetchPendingBookings = async () => {
      if (selectedFacility) {
        try {
          const bookings = await getPendingBookingsForFacility(selectedFacility)
          setPendingBookings(bookings)
        } catch (err) {
          console.error('Error fetching pending bookings:', err)
          toast.error('Failed to load pending bookings')
        }
      }
    }

    fetchPendingBookings()
  }, [selectedFacility])

  // Handle booking approval
  const handleApproveBooking = async (bookingId) => {
    setProcessingBooking(bookingId)
    try {
      const result = await approveBooking(bookingId)
      
      if (result.success) {
        toast.success('Booking approved successfully! ✅', {
          description: 'The customer has been notified of the approval.',
        })
        
        // Remove the booking from pending list
        setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId))
      } else {
        toast.error('Failed to approve booking', {
          description: result.message,
        })
      }
    } catch (err) {
      console.error('Error approving booking:', err)
      toast.error('Error approving booking')
    } finally {
      setProcessingBooking(null)
    }
  }

  // Handle booking rejection
  const handleRejectBooking = async (bookingId, reason = '') => {
    setProcessingBooking(bookingId)
    try {
      const result = await rejectBooking(bookingId, reason)
      
      if (result.success) {
        toast.success('Booking rejected', {
          description: 'The customer has been notified of the rejection.',
        })
        
        // Remove the booking from pending list
        setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId))
      } else {
        toast.error('Failed to reject booking', {
          description: result.message,
        })
      }
    } catch (err) {
      console.error('Error rejecting booking:', err)
      toast.error('Error rejecting booking')
    } finally {
      setProcessingBooking(null)
    }
  }

  // Format date and time
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (time) => {
    const [hour] = time.split(':')
    const hourInt = parseInt(hour)
    const period = hourInt >= 12 ? 'PM' : 'AM'
    const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt
    return `${displayHour}:00 ${period}`
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // No facilities state
  if (facilities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No facilities found. Please add a facility first.</p>
          <Button onClick={() => router.push('/facility/new')}>
            Add Facility
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Requests</h1>
          <p className="text-gray-600">Review and approve booking requests for your facilities</p>
        </div>

        {/* Facility Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {facilities.map((facility) => (
                <Button
                  key={facility.id}
                  variant={selectedFacility === facility.id ? "default" : "outline"}
                  onClick={() => setSelectedFacility(facility.id)}
                  className={selectedFacility === facility.id ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {facility.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Approval ({pendingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No pending booking requests</p>
                  <p className="text-sm">All bookings are up to date!</p>
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <Card key={booking.id} className="border border-orange-200 bg-orange-50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          {/* Customer Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="text-sm font-semibold">
                                {booking.user.firstName?.charAt(0)}{booking.user.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.user.firstName} {booking.user.lastName}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{booking.user.email}</span>
                                </div>
                                {booking.user.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{booking.user.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              🏸 {booking.court.name} - {booking.court.sportType}
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>{formatDate(booking.bookingDate)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 font-semibold">
                                  ₹{booking.totalPrice.toFixed(2)} ({booking.duration}h)
                                </span>
                              </div>
                            </div>

                            {booking.notes && (
                              <div className="bg-gray-50 rounded p-3 mt-3">
                                <p className="text-sm text-gray-700">
                                  <strong>Notes:</strong> {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Request Time */}
                          <div className="text-xs text-gray-500 mb-4">
                            Requested on: {new Date(booking.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectBooking(booking.id, 'Rejected by facility manager')}
                          disabled={processingBooking === booking.id}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          {processingBooking === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApproveBooking(booking.id)}
                          disabled={processingBooking === booking.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingBooking === booking.id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FacilityBookingsPage
