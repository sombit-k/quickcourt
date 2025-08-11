"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Phone, Mail, Loader2, Edit } from 'lucide-react'
import { getCurrentUser } from '@/actions/user-sync'
import Link from 'next/link'

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user: clerkUser, isLoaded } = useUser()

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && clerkUser) {
        try {
          setLoading(true)
          const userData = await getCurrentUser(clerkUser.id)
          setUserData(userData)
        } catch (err) {
          console.error('Error fetching user data:', err)
          setError('Failed to load user profile')
        } finally {
          setLoading(false)
        }
      } else if (isLoaded && !clerkUser) {
        setLoading(false)
        setError('User not authenticated')
      }
    }

    fetchUserData()
  }, [clerkUser, isLoaded])

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Use actual user data or fallback to clerk data
  const user = {
    name: userData && userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData?.fullName 
      ? userData.fullName
      : clerkUser 
      ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User'
      : 'User',
    phone: userData?.phone || clerkUser?.phoneNumbers?.[0]?.phoneNumber || "Not provided",
    email: userData?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "Not provided",
    avatar: userData?.avatar || clerkUser?.imageUrl || ""
  }

  // Transform bookings data
  const bookings = userData?.bookings?.map(booking => {
    const facility = booking.court?.facility
    const bookingDate = new Date(booking.bookingDate)
    const currentDate = new Date()
    const isPast = bookingDate < currentDate

    return {
      id: booking.id,
      venue: `${facility?.name || 'Unknown Venue'} (${booking.court?.sportType || 'Unknown Sport'})`,
      date: bookingDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }),
      time: `${booking.startTime} - ${booking.endTime}`,
      location: facility ? `${facility.city}, ${facility.state}` : 'Unknown Location',
      status: booking.status,
      isPast
    }
  }) || []

  const filteredBookings = activeTab === 'all' ? bookings : bookings.filter(booking => booking.status === 'CANCELLED')

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-25">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar - User Profile */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            {/* User Avatar and Info */}
            <div className="text-center mb-6">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                {user.name}
              </h1>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="break-all">{user.email}</span>
                </div>
              </div>
            </div>

            <Link href="/profile/edit">
              <Button variant="outline" className="w-full mb-6">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>

            {/* Navigation */}
            <div className="space-y-2">
              <Button 
                variant="default" 
                className="w-full justify-start bg-green-100 text-green-800 hover:bg-green-200"
                disabled
              >
                All Bookings
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Content - Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {/* Tabs */}
              <div className="flex gap-4 mb-4">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('all')}
                  className={activeTab === 'all' ? 'bg-green-100 text-green-800' : ''}
                >
                  All Bookings
                </Button>
                <Button
                  variant={activeTab === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('cancelled')}
                  className={activeTab === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                >
                  Cancelled
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Bookings List */}
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No {activeTab === 'cancelled' ? 'cancelled' : ''} bookings found
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <Card key={booking.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-2">
                              🏸 {booking.venue}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-orange-500" />
                                <span>{booking.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>{booking.location}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm text-gray-600">Status:</span>
                              <Badge 
                                variant="secondary" 
                                className={
                                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }
                              >
                                {booking.status === 'CONFIRMED' ? '✅' : 
                                 booking.status === 'CANCELLED' ? '❌' : 
                                 booking.status === 'PENDING' ? '⏳' : '📋'} {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {!booking.isPast && booking.status !== 'CANCELLED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              [Cancel Booking]
                            </Button>
                          )}
                          {booking.isPast && booking.status !== 'CANCELLED' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              [Write Review]
                            </Button>
                          )}
                          {booking.isPast && (
                            <div className="ml-auto text-xs text-gray-500">
                              {booking.status === 'CANCELLED' ? 'Booking was cancelled' : 'No cancel booking button for past dates'}
                            </div>
                          )}
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
    </div>
  )
}

export default ProfilePage