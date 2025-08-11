"use client";

import React, { useState, useEffect, use } from 'react';
import { Star, Clock, MapPin, Phone, Mail, Globe, Car, Wifi, Coffee, Users, Camera, Calendar, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { getVenueById } from '@/actions/venue-actions';

// Dummy data - this will be replaced with dynamic data from the database
const DUMMY_VENUE_DATA = {
  id: '1',
  name: 'SRR Badminton',
  description: 'Premier badminton facility with professional courts and modern amenities. Perfect for both casual players and professional training.',
  rating: 4.8,
  totalReviews: 156,
  location: 'Koramangala, Bangalore',
  address: '123 Main Street, Koramangala, Bangalore, Karnataka 560034',
  phone: '+91 98765 43210',
  email: 'info@srrbadminton.com',
  website: 'www.srrbadminton.com',
  images: [
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300',
    '/api/placeholder/400/300'
  ],
  operatingHours: {
    Monday: '6:00 AM - 11:00 PM',
    Tuesday: '6:00 AM - 11:00 PM',
    Wednesday: '6:00 AM - 11:00 PM',
    Thursday: '6:00 AM - 11:00 PM',
    Friday: '6:00 AM - 11:00 PM',
    Saturday: '6:00 AM - 11:00 PM',
    Sunday: '7:00 AM - 10:00 PM'
  },
  amenities: [
    { name: 'Parking', icon: Car, available: true },
    { name: 'WiFi', icon: Wifi, available: true },
    { name: 'Cafeteria', icon: Coffee, available: true },
    { name: 'Changing Rooms', icon: Users, available: true },
    { name: 'Equipment Rental', icon: Users, available: false },
    { name: 'Lockers', icon: Users, available: true }
  ],
  courts: [
    {
      id: 'court1',
      name: 'Court 1',
      type: 'Premium',
      pricePerHour: 800,
      features: ['Air Conditioned', 'Professional Lighting']
    },
    {
      id: 'court2', 
      name: 'Court 2',
      type: 'Standard',
      pricePerHour: 600,
      features: ['Fan Cooled', 'Good Lighting']
    },
    {
      id: 'court3',
      name: 'Court 3', 
      type: 'Standard',
      pricePerHour: 600,
      features: ['Fan Cooled', 'Good Lighting']
    }
  ],
  reviews: [
    {
      id: 1,
      userName: 'Rajesh Kumar',
      rating: 5,
      date: '15 days ago',
      comment: 'Excellent facility with top-notch courts. The staff is very helpful and the booking process is smooth.'
    },
    {
      id: 2,
      userName: 'Priya Sharma',
      rating: 5,
      date: '1 month ago', 
      comment: 'Great place for badminton. Clean courts and good equipment. Highly recommended!'
    },
    {
      id: 3,
      userName: 'Amit Patel',
      rating: 4,
      date: '2 months ago',
      comment: 'Good courts but can get crowded during peak hours. Overall a nice experience.'
    },
    {
      id: 4,
      userName: 'Sneha Reddy',
      rating: 5,
      date: '3 months ago',
      comment: 'Amazing facility! The courts are well-maintained and the staff is professional.'
    },
    {
      id: 5,
      userName: 'Karthik Singh',
      rating: 4,
      date: '4 months ago',
      comment: 'Decent place for playing badminton. Good location and easy parking.'
    }
  ],
  bookingOptions: {
    quickBook: true,
    advanceBooking: 30, // days
    cancellationPolicy: '24 hours before booking time'
  }
};

const VenueDetailPage = ({ params }) => {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const venueId = resolvedParams.id;
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch venue data when component mounts
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch real data from database
        try {
          const venueData = await getVenueById(venueId);
          
          // Transform database data to match our component structure
          const transformedVenue = {
            ...venueData,
            images: (venueData.images && venueData.images.length > 0) ? venueData.images : ['/api/placeholder/400/300'],
            amenities: (venueData.amenities || []).map(amenity => ({
              name: amenity,
              icon: getAmenityIcon(amenity),
              available: true
            })),
            operatingHours: venueData.operatingHours || DUMMY_VENUE_DATA.operatingHours,
            reviews: (venueData.reviewsData || []).map(review => ({
              ...review,
              date: formatDate(review.createdAt)
            })),
            // Transform courts to match the expected structure
            courts: (venueData.courts || []).map(court => ({
              id: court.id,
              name: court.name,
              type: court.sportType.charAt(0).toUpperCase() + court.sportType.slice(1), // Convert to proper case
              pricePerHour: court.pricePerHour,
              features: court.images && court.images.length > 0 
                ? ['Professional Court', 'Good Lighting'] 
                : ['Standard Court']
            }))
          };
          
          setVenue(transformedVenue);
        } catch (dbError) {
          console.warn('Could not fetch from database, using dummy data:', dbError);
          // Fallback to dummy data if database fetch fails
          setVenue(DUMMY_VENUE_DATA);
        }
      } catch (err) {
        console.error('Error loading venue:', err);
        setError('Failed to load venue details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [venueId]);

  // Helper function to get amenity icons
  const getAmenityIcon = (amenityName) => {
    const iconMap = {
      'Parking': Car,
      'WiFi': Wifi,
      'Cafeteria': Coffee,
      'Changing Rooms': Users,
      'Equipment Rental': Users,
      'Lockers': Users,
      'Air Conditioning': Users,
      'Restrooms': Users,
      'Pro Shop': Users,
    };
    return iconMap[amenityName] || Users;
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const nextImage = () => {
    if (venue?.images && venue.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === venue.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (venue?.images && venue.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? venue.images.length - 1 : prev - 1
      );
    }
  };

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
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
    );
  }

  // Handle venue not found
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/venue" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Venues
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Venue Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{venue.rating}</span>
                        <span>({venue.totalReviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{venue.location}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Book This Venue
                  </Button>
                </div>
                
                {/* Image Gallery */}
                <div className="relative">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={(venue.images && venue.images.length > 0) ? venue.images[currentImageIndex] : '/api/placeholder/400/300'} 
                      alt={`${venue.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows */}
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {(venue.images || []).length}
                    </div>
                  </div>
                  
                  {/* Thumbnail Navigation */}
                  <div className="flex gap-2 mt-4">
                    {(venue.images || []).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <img 
                          src={image} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About this venue</h2>
                <p className="text-gray-700 leading-relaxed">{venue.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(venue.amenities || []).map((amenity, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        amenity.available ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      <amenity.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{amenity.name}</span>
                      {amenity.available && <span className="text-xs">✓</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Court Options */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Court Options</h2>
                <div className="space-y-4">
                  {(venue.courts || []).map((court) => (
                    <div key={court.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{court.name}</h3>
                          <Badge variant="outline" className="text-xs">{court.type}</Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-green-600">₹{court.pricePerHour}</span>
                          <span className="text-sm text-gray-500">/hour</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(court.features || []).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {(!court.features || court.features.length === 0) && (
                          <Badge variant="secondary" className="text-xs">
                            Standard Court
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Player Reviews & Ratings</h2>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-semibold">{venue.rating}</span>
                    <span className="text-gray-500">({venue.totalReviews} reviews)</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {(venue.reviews || []).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.userName}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Show all reviews
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Booking Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Operating Hours */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(venue.operatingHours || {}).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{day}</span>
                        <span className="font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Location Map */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Location Map</h3>
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Interactive Map</p>
                      <p className="text-xs">Coming Soon</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-600" />
                      <span>{venue.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span>{venue.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span>{venue.email}</span>
                    </div>
                    {venue.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span>{venue.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Section */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Booking</h3>
                  
                  {/* Date Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTimeSlot(time)}
                          className={`p-2 text-xs border rounded ${
                            selectedTimeSlot === time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700 mb-3">
                    Book Now
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Check Availability
                  </Button>
                  
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    <p>Free cancellation up to 24 hours before booking</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailPage;
