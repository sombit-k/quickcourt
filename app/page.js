"use client";

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { ThreeDCardDemo } from "@/components/ui/3d-card";
import { VortexDemo } from "@/components/call-to-action";
import { WavyBackground } from "@/components/ui/wavy-background";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Meteors } from "@/components/ui/meteors";
import { Search, MapPin, Star, ChevronLeft, ChevronRight, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getTopRatedVenues } from '@/actions/venue-actions'

const LandingPage = () => {
  // Autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const searchInputRef = useRef(null);

  // Venues state
  const [venues, setVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);

  // Fetch top rated venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoadingVenues(true);
        const topVenues = await getTopRatedVenues(4);
        setVenues(topVenues);
      } catch (error) {
        console.error('Error fetching venues:', error);
        // Fallback to static data if there's an error
        setVenues([
          {
            id: 1,
            name: "Elite Badminton",
            rating: 4.5,
            reviews: 128,
            location: "Koramangala",
            price: "₹400/hr",
            sports: ["Badminton"],
            color: "from-blue-600 to-purple-600",
            bookingCourtId: null
          },
          {
            id: 2,
            name: "Pro Basketball",
            rating: 4.7,
            reviews: 95,
            location: "Indiranagar", 
            price: "₹500/hr",
            sports: ["Basketball"],
            color: "from-orange-500 to-red-600",
            bookingCourtId: null
          },
          {
            id: 3,
            name: "Tennis Academy",
            rating: 4.6,
            reviews: 203,
            location: "Whitefield",
            price: "₹600/hr", 
            sports: ["Tennis"],
            color: "from-green-500 to-teal-600",
            bookingCourtId: null
          },
          {
            id: 4,
            name: "Football Turf",
            rating: 4.4,
            reviews: 156,
            location: "HSR Layout",
            price: "₹800/hr",
            sports: ["Football"],
            color: "from-purple-500 to-pink-600",
            bookingCourtId: null
          }
        ]);
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  // Sample venues/locations data for autocomplete
  const venuesSuggestions = [
    { name: "Elite Badminton Center", location: "Koramangala, Bangalore", type: "venue" },
    { name: "Pro Basketball Arena", location: "Indiranagar, Bangalore", type: "venue" },
    { name: "Tennis Academy", location: "Whitefield, Bangalore", type: "venue" },
    { name: "Football Turf", location: "HSR Layout, Bangalore", type: "venue" },
    { name: "Cricket Ground", location: "MG Road, Bangalore", type: "venue" },
    { name: "Swimming Pool Complex", location: "Jayanagar, Bangalore", type: "venue" },
    { name: "Badminton Courts", location: "Ahmedabad, Gujarat", type: "venue" },
    { name: "Tennis Club", location: "Mumbai, Maharashtra", type: "venue" },
    { name: "Sports Complex", location: "Delhi, NCR", type: "venue" },
    { name: "Fitness Center", location: "Pune, Maharashtra", type: "venue" },
    // Location suggestions
    { name: "Bangalore", location: "Karnataka", type: "city" },
    { name: "Ahmedabad", location: "Gujarat", type: "city" },
    { name: "Mumbai", location: "Maharashtra", type: "city" },
    { name: "Delhi", location: "NCR", type: "city" },
    { name: "Pune", location: "Maharashtra", type: "city" },
    { name: "Chennai", location: "Tamil Nadu", type: "city" },
    { name: "Hyderabad", location: "Telangana", type: "city" },
    { name: "Kolkata", location: "West Bengal", type: "city" },
  ];

  // Handle input change and filter suggestions
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = venuesSuggestions.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
    setActiveSuggestion(-1);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        selectSuggestion(filteredSuggestions[activeSuggestion]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    
    // Navigate based on suggestion type
    if (suggestion.type === 'venue') {
      // If it's a venue, search for venues with that name
      window.location.href = `/venue?search=${encodeURIComponent(suggestion.name)}`;
    } else {
      // If it's a city, search for venues in that city
      window.location.href = `/venue?location=${encodeURIComponent(suggestion.name)}`;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to venue page with search query
      window.location.href = `/venue?search=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = `/venue`;
    }
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularSports = [
    { name: "Badminton", icon: "🏸", color: "from-blue-500 to-cyan-500" },
    { name: "Cricket", icon: "🏏", color: "from-green-500 to-emerald-500" },
    { name: "Tennis", icon: "🎾", color: "from-yellow-500 to-orange-500" },
    { name: "Swimming", icon: "🏊", color: "from-blue-400 to-blue-600" },
    { name: "Boxing", icon: "🥊", color: "from-red-500 to-pink-500" },
    { name: "Table Tennis", icon: "🏓", color: "from-purple-500 to-indigo-500" }
  ];

  const words = [
    {
      text: "Find",
      className: "text-white",
    },
    {
      text: "Your",
      className: "text-white",
    },
    {
      text: "Perfect",
      className: "text-white",
    },
    {
      text: "Sports",
      className: "text-blue-600",
    },
    {
      text: "Venue",
      className: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden pt-20">
      {/* Hero Section with Vortex Background */}
      <section className="relative h-screen bg-gradient-to-br from-gray-50 to-white">
        <VortexDemo />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-7xl md:text-9xl font-bold mb-8 pt-30">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent ">
                  QUICKCOURT
                </span>
              </h1>
              
              <div className="mb-8">
                <TypewriterEffect words={words} className="text-white" />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto">
                Discover premium sports facilities across India. Connect with players, 
                book venues, and elevate your game with our cutting-edge platform.
              </p>

              {/* Search Section within Hero */}
              <div className="mb-12 max-w-2xl mx-auto">
                <Card className="p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative" ref={searchInputRef}>
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter location or venue name..."
                        className="w-full pl-10 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                      
                      {/* Autocomplete Suggestions Dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                          {filteredSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectSuggestion(suggestion)}
                              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                                index === activeSuggestion
                                  ? 'bg-blue-50 text-gray-900'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {suggestion.type === 'venue' ? (
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-sm font-bold">V</span>
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                                      <MapPin className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{suggestion.name}</div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {suggestion.location}
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    suggestion.type === 'venue' 
                                      ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                                      : 'bg-green-100 text-green-600 border border-green-200'
                                  }`}>
                                    {suggestion.type === 'venue' ? 'Venue' : 'City'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* No results message */}
                      {showSuggestions && searchQuery.length > 0 && filteredSuggestions.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                          <div className="px-4 py-6 text-center text-gray-500">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No venues or cities found</p>
                            <p className="text-xs mt-1">Try searching for "Bangalore", "Mumbai", or venue names</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleSearch}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Search Venues
                    </Button>
                  </div>
                </Card>
              </div>
              
              <div className="flex  flex-row gap-6 justify-center items-center mb-12 pb-10">
                <Link href="/venue">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Explore Venues
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-white text-blue hover:bg-gray hover:text-gray-900 transition-all duration-300">
                  Join Community
                </Button>
              </div>
              
            </motion.div>
          </div>
        </div>
        
      </section>

      {/* Book Venues Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Premium Venues
              </span>
            </h2>
            <Link href="/venue">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                See all venues &rarr;
              </Button>
            </Link>
          </div>

          {isLoadingVenues ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="animate-pulse">
                  <Card className="h-full shadow-lg border border-gray-200">
                    <div className="relative overflow-hidden rounded-t-xl">
                      <div className="w-full h-48 bg-gray-300"></div>
                    </div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-1/2"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                        <div className="h-10 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-semibold mb-2">No Venues Available</h3>
                <p className="text-lg">Check back soon for new venues in your area!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {venues.map((venue, index) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/venue/${venue.id}`}>
                    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer transform hover:scale-105">
                      <div className="relative overflow-hidden rounded-t-xl">
                        <div className={`w-full h-48 bg-gradient-to-br ${venue.color} flex items-center justify-center relative`}>
                          <span className="text-white text-6xl font-bold opacity-20">
                            {venue.sports && venue.sports[0] ? venue.sports[0][0].toUpperCase() : 'S'}
                          </span>
                          {venue.totalCourts && (
                            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                              <span className="text-white text-xs font-medium">
                                {venue.totalCourts} {venue.totalCourts === 1 ? 'Court' : 'Courts'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-1">{venue.name}</h3>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-700">
                              {venue.rating ? venue.rating.toFixed(1) : '0.0'}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">
                              ({venue.reviews || 0} {venue.reviews === 1 ? 'review' : 'reviews'})
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 flex items-center line-clamp-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          {venue.location}
                        </p>
                        {venue.sports && venue.sports.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {venue.sports.slice(0, 2).map((sport, sportIndex) => (
                              <span
                                key={sportIndex}
                                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                              >
                                {sport}
                              </span>
                            ))}
                            {venue.sports.length > 2 && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                +{venue.sports.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                            {venue.price}
                          </span>
                          <Button 
                            className={`bg-gradient-to-r ${venue.color} hover:scale-105 transition-transform text-white`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (venue.bookingCourtId) {
                                window.location.href = `/book/${venue.bookingCourtId}`;
                              } else {
                                window.location.href = `/venue/${venue.id}`;
                              }
                            }}
                          >
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Navigation with clean styling */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" className="rounded-full w-12 h-12 p-0 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full w-12 h-12 p-0 border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-300">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Popular Sports
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover trending sports and join the community
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {popularSports.map((sport, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <Card className={`h-40 bg-gradient-to-br ${sport.color} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0`}>
                  <div className="relative h-full flex flex-col items-center justify-center text-white">
                    <span className="text-4xl mb-2">{sport.icon}</span>
                    <span className="text-lg font-bold">{sport.name}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full w-3/4 transition-all duration-300 group-hover:w-full" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Ready to Play?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of sports enthusiasts and start your journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started Now
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-white text-blue hover:bg-white hover:text-black transition-all duration-300">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
