import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react'

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('all')

  // Dummy user data
  const user = {
    name: "Mitchell Admin",
    phone: "9999999999",
    email: "mitchelloadmin2017@gmail.com",
    avatar: "" // Will use fallback
  }

  // Dummy bookings data
  const bookings = [
    {
      id: 1,
      venue: "SkyLine Badminton Court (Badminton)",
      date: "18 June 2025",
      time: "5:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      isPast: false
    },
    {
      id: 2,
      venue: "SkyLine Badminton Court (Badminton)",
      date: "18 June 2024",
      time: "5:00 PM - 6:00 PM", 
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      isPast: true
    }
  ]

  const filteredBookings = activeTab === 'all' ? bookings : bookings.filter(booking => booking.status === 'Cancelled')

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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

            <Button variant="outline" className="w-full mb-6">
              Edit Profile
            </Button>

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
                                className="bg-green-100 text-green-800"
                              >
                                ✅ {booking.status}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {!booking.isPast && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              [Cancel Booking]
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            [Write Review]
                          </Button>
                          {booking.isPast && (
                            <div className="ml-auto text-xs text-gray-500">
                              No cancel booking button for past dates
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