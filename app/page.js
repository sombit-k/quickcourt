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
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { Search, MapPin, Star, ChevronLeft, ChevronRight, Users, Trophy, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
  // Autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchInputRef = useRef(null);

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
    // You can add navigation logic here
    console.log('Selected:', suggestion);
  };

  // Handle search
  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    // Add search logic here
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

  const venues = [
    {
      id: 1,
      name: "Elite Badminton",
      rating: 4.5,
      reviews: 128,
      location: "Koramangala",
      price: "₹400/hr",
      sports: ["Badminton"],
      image: "/api/placeholder/300/200",
      color: "from-blue-600 to-purple-600"
    },
    {
      id: 2,
      name: "Pro Basketball",
      rating: 4.7,
      reviews: 95,
      location: "Indiranagar", 
      price: "₹500/hr",
      sports: ["Basketball"],
      image: "/api/placeholder/300/200",
      color: "from-orange-500 to-red-600"
    },
    {
      id: 3,
      name: "Tennis Academy",
      rating: 4.6,
      reviews: 203,
      location: "Whitefield",
      price: "₹600/hr", 
      sports: ["Tennis"],
      image: "/api/placeholder/300/200",
      color: "from-green-500 to-teal-600"
    },
    {
      id: 4,
      name: "Football Turf",
      rating: 4.4,
      reviews: 156,
      location: "HSR Layout",
      price: "₹800/hr",
      sports: ["Football"],
      image: "/api/placeholder/300/200",
      color: "from-purple-500 to-pink-600"
    }
  ];

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
    },
    {
      text: "Your",
    },
    {
      text: "Perfect",
    },
    {
      text: "Sports",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "Venue",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section with Vortex Background */}
      <section className="relative h-screen">
        <VortexDemo />
        
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-7xl md:text-9xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  QUICKCOURT
                </span>
              </h1>
              
              <div className="mb-8">
                <TypewriterEffect words={words} />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
                Discover premium sports facilities across India. Connect with players, 
                book venues, and elevate your game with our cutting-edge platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                  Explore Venues
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300 backdrop-blur-sm">
                  Join Community
                </Button>
              </div>
              
              {/* Stats */}
              <div className="mt-16 flex flex-wrap justify-center items-center gap-12 text-gray-300">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-400" />
                  <span className="text-xl font-medium">50K+ Players</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  <span className="text-xl font-medium">1000+ Venues</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-green-400" />
                  <span className="text-xl font-medium">24/7 Booking</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
      </section>

      {/* Search Section with Wavy Background */}
      <section className="relative py-20">
        <WavyBackground className="max-w-4xl mx-auto pb-40">
          <div className="relative z-10 px-6">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Find Your Venue 
                {/* Implement an auto complete feature at "Find your venue"  */}
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Search for the best sports venues near you
              </p>
            </motion.div>

            <div className="relative">
              <CardSpotlight className="p-8 max-w-2xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative" ref={searchInputRef}>
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter location or venue name..."
                      className="w-full pl-10 pr-4 py-4 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm"
                    />
                    
                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => selectSuggestion(suggestion)}
                            className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                              index === activeSuggestion
                                ? 'bg-blue-600/20 text-white'
                                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
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
                                <div className="text-xs text-gray-400 truncate">
                                  {suggestion.location}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  suggestion.type === 'venue' 
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                                    : 'bg-green-600/20 text-green-400 border border-green-600/30'
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
                      <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-gray-600 rounded-xl shadow-xl z-50">
                        <div className="px-4 py-6 text-center text-gray-400">
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
              </CardSpotlight>
            </div>
          </div>
        </WavyBackground>
      </section>

      {/* Book Venues Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Premium Venues
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Book world-class sports facilities with state-of-the-art equipment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CardSpotlight className="h-full">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <div className={`w-full h-48 bg-gradient-to-br ${venue.color} flex items-center justify-center relative`}>
                      <span className="text-white text-6xl font-bold opacity-20">{venue.sports[0][0]}</span>
                      <Meteors number={20} />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 text-white">{venue.name}</h3>
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium text-gray-300">{venue.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({venue.reviews})</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {venue.location}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        {venue.price}
                      </span>
                      <Button className={`bg-gradient-to-r ${venue.color} hover:scale-105 transition-transform`}>
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>
            ))}
          </div>

          {/* Navigation with glow effect */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" className="rounded-full w-12 h-12 p-0 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full w-12 h-12 p-0 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black transition-all duration-300">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Sports Section with Canvas Reveal Effect */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Popular Sports
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
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
                <div className={`relative h-40 bg-gradient-to-br ${sport.color} rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-${sport.color.split('-')[1]}-500/50 transition-all duration-300`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300" />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                    <span className="text-4xl mb-2">{sport.icon}</span>
                    <span className="text-lg font-bold">{sport.name}</span>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <CanvasRevealEffect
                      animationSpeed={3}
                      containerClassName="bg-transparent"
                      colors={[
                        [59, 130, 246],
                        [139, 92, 246],
                      ]}
                      dotSize={2}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full w-3/4 transition-all duration-300 group-hover:w-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Ready to Play?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of sports enthusiasts and start your journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-105">
                Get Started Now
              </Button>
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300">
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
//                 <p className="text-sm text-gray-500 mt-1">
//                   To search near from the page Mention,
//                   All other elements and layout should remain unchanged.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Book Venues Section */}
//       <section className="py-12 px-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-2xl font-bold text-gray-900">Book Venues</h2>
//             <Link href="/venues" className="text-blue-600 hover:text-blue-800 font-medium">
//               See all venues →
//             </Link>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {venues.map((venue) => (
//               <Card key={venue.id} className="hover:shadow-lg transition-shadow cursor-pointer">
//                 <CardContent className="p-0">
//                   <div className="relative">
//                     <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
//                       <span className="text-gray-500 text-lg font-medium">Image</span>
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-bold text-lg mb-1">{venue.name}</h3>
//                     <div className="flex items-center mb-2">
//                       <div className="flex items-center">
//                         <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                         <span className="ml-1 text-sm font-medium">{venue.rating}</span>
//                         <span className="ml-1 text-sm text-gray-500">({venue.reviews})</span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
//                     <div className="flex justify-between items-center">
//                       <span className="text-lg font-bold text-green-600">{venue.price}</span>
//                       <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
//                         Book
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           {/* Navigation arrows */}
//           <div className="flex justify-center gap-4">
//             <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//       </section>

//       {/* Popular Sports Section */}
//       <section className="py-12 px-4 bg-white">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Sports</h2>
          
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//             {popularSports.map((sport, index) => (
//               <div key={index} className="relative group cursor-pointer">
//                 <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
//                   <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
//                     <span className="text-white font-medium">{sport.name}</span>
//                   </div>
//                 </div>
//                 <div className="absolute bottom-2 left-2">
//                   <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
//                     {sport.name}
//                   </span>
//                 </div>
//               </div>
//             ))}

// export default LandingPage;
