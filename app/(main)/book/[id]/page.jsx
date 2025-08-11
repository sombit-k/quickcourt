"use client"
import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar,
  MapPin, 
  Phone, 
  Star,
  Loader2,
  CreditCard,
  Check,
  X,
  Users,
  Minus,
  Plus
} from 'lucide-react'
import { getVenueById } from '@/actions/venue-actions'
import { createBooking, getAvailableTimeSlots } from '@/actions/booking-actions'
import Link from 'next/link'

const BookingPage = ({ params }) => {
  const resolvedParams = use(params)
  const venueId = resolvedParams.id
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()

  // State management
  const [venue, setVenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    selectedCourt: '',
    selectedDate: new Date().toISOString().split('T')[0],
    selectedTime: '',
    duration: 1,
    notes: ''
  })

  // Fetch venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true)
        const venueData = await getVenueById(venueId)
        setVenue(venueData)
      } catch (err) {
        console.error('Error fetching venue:', err)
        setError('Failed to load venue details')
      } finally {
        setLoading(false)
      }
    }

    if (venueId) {
      fetchVenueData()
    }
  }, [venueId])

  // Fetch available time slots when court or date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (bookingForm.selectedCourt && bookingForm.selectedDate) {
        try {
          setLoadingSlots(true)
          const slots = await getAvailableTimeSlots(bookingForm.selectedCourt, bookingForm.selectedDate)
          setAvailableSlots(slots)
        } catch (err) {
          console.error('Error fetching time slots:', err)
          setAvailableSlots([])
        } finally {
          setLoadingSlots(false)
        }
      }
    }

    fetchAvailableSlots()
  }, [bookingForm.selectedCourt, bookingForm.selectedDate])

  // Calculate total price
  const selectedCourt = venue?.courts?.find(court => court.id === bookingForm.selectedCourt)
  const totalPrice = selectedCourt ? selectedCourt.pricePerHour * bookingForm.duration : 0

  // Handle form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    if (!clerkUser) {
      toast.error('Please sign in to make a booking')
      return
    }

    if (!bookingForm.selectedCourt || !bookingForm.selectedDate || !bookingForm.selectedTime) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Calculate end time
      const [startHour] = bookingForm.selectedTime.split(':')
      const endHour = String(parseInt(startHour) + bookingForm.duration).padStart(2, '0')
      const endTime = `${endHour}:00`

      const bookingData = {
        facilityId: venue.id,
        courtId: bookingForm.selectedCourt,
        bookingDate: bookingForm.selectedDate,
        startTime: bookingForm.selectedTime,
        endTime: endTime,
        duration: bookingForm.duration,
        pricePerHour: selectedCourt.pricePerHour,
        totalPrice: totalPrice,
        notes: bookingForm.notes
      }

      const result = await createBooking(bookingData)

      if (result.success) {
        // Show success toast
        toast.success('Booking confirmed successfully! 🎉', {
          description: `Your court booking for ${venue.name} has been saved.`,
          duration: 5000,
        })
        
        // Reset form
        setBookingForm({
          selectedCourt: '',
          selectedDate: new Date().toISOString().split('T')[0],
          selectedTime: '',
          duration: 1,
          notes: ''
        })
        
        // Redirect to profile with success message after a short delay
        setTimeout(() => {
          router.push('/profile?booking=success')
        }, 2000)
      } else {
        toast.error('Booking failed', {
          description: result.message || 'Unable to create booking. Please try again.',
        })
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      toast.error('Booking failed', {
        description: 'Failed to create booking. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Generate time slots for display
  const formatTimeSlot = (time) => {
    const [hour] = time.split(':')
    const hourInt = parseInt(hour)
    const period = hourInt >= 12 ? 'PM' : 'AM'
    const displayHour = hourInt === 0 ? 12 : hourInt > 12 ? hourInt - 12 : hourInt
    return `${displayHour}:00 ${period}`
  }

  // Handle duration change
  const handleDurationChange = (increment) => {
    const newDuration = bookingForm.duration + increment
    if (newDuration >= 1 && newDuration <= 8) {
      setBookingForm(prev => ({ ...prev, duration: newDuration }))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !venue) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/venue">
            <Button variant="outline">
              ← Back to Venues
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Venue not found</p>
          <Link href="/venue">
            <Button variant="outline">
              ← Back to Venues
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href={`/venue/${venueId}`}>
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Venue
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Book Court</h1>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Side - Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  
                  {/* Court Selection */}
                  <div>
                    <Label htmlFor="court">Select Court *</Label>
                    <Select 
                      value={bookingForm.selectedCourt} 
                      onValueChange={(value) => setBookingForm(prev => ({ ...prev, selectedCourt: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a court" />
                      </SelectTrigger>
                      <SelectContent>
                        {venue.courts?.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{court.name} - {court.sportType}</span>
                              <span className="text-green-600 font-semibold ml-4">
                                ₹{court.pricePerHour}/hr
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label htmlFor="date">Select Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={bookingForm.selectedDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, selectedDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <Label>Duration *</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDurationChange(-1)}
                        disabled={bookingForm.duration <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-semibold">{bookingForm.duration}</span>
                        <span className="text-gray-600">hour{bookingForm.duration !== 1 ? 's' : ''}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDurationChange(1)}
                        disabled={bookingForm.duration >= 8}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                    <Label>Select Time Slot *</Label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Loading available slots...</span>
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={bookingForm.selectedTime === slot ? "default" : "outline"}
                            size="sm"
                            onClick={() => setBookingForm(prev => ({ ...prev, selectedTime: slot }))}
                            className={bookingForm.selectedTime === slot ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {formatTimeSlot(slot)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {bookingForm.selectedCourt ? 'No available slots for this date' : 'Please select a court first'}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements or notes..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={submitting || !bookingForm.selectedCourt || !bookingForm.selectedTime}
                    className="w-full bg-green-600 hover:bg-green-700"
                  > 

                {/* on clicking this button save the booking to the db with relation to the user. and show a toast that the data has been saved */}
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Booking...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Confirm Booking - ₹{totalPrice.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Venue Info & Booking Summary */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Venue Info */}
            <Card>
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{venue.address}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{venue.phone}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                  <span>{venue.rating?.toFixed(1)} ({venue.totalReviews} reviews)</span>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {bookingForm.selectedCourt && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-medium">{selectedCourt?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(bookingForm.selectedDate).toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {bookingForm.selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {formatTimeSlot(bookingForm.selectedTime)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingForm.duration} hour{bookingForm.duration !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-medium">₹{selectedCourt?.pricePerHour}/hr</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
