"use client";

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";

const LandingPage = () => {
  const venues = [
    {
      id: 1,
      name: "Elite Badminton",
      rating: 4.5,
      reviews: 128,
      location: "Koramangala",
      price: "₹400/hr",
      sports: ["Badminton"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      name: "Pro Basketball",
      rating: 4.7,
      reviews: 95,
      location: "Indiranagar", 
      price: "₹500/hr",
      sports: ["Basketball"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      name: "Tennis Academy",
      rating: 4.6,
      reviews: 203,
      location: "Whitefield",
      price: "₹600/hr", 
      sports: ["Tennis"],
      image: "/api/placeholder/300/200"
    },
    {
      id: 4,
      name: "Football Turf",
      rating: 4.4,
      reviews: 156,
      location: "HSR Layout",
      price: "₹800/hr",
      sports: ["Football"],
      image: "/api/placeholder/300/200"
    }
  ];

  const popularSports = [
    { name: "Badminton", image: "/api/placeholder/120/120" },
    { name: "Cricket", image: "/api/placeholder/120/120" },
    { name: "Tennis", image: "/api/placeholder/120/120" },
    { name: "Swimming", image: "/api/placeholder/120/120" },
    { name: "Boxing", image: "/api/placeholder/120/120" },
    { name: "Table Tennis", image: "/api/placeholder/120/120" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section with Search */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              QUICKCOURT
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Click here to search for the locations in India
              where enthusiasts or organizations can online
              sports performances live and find best sport
              sports infrastructure best for you.
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Ahmedabad"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="lg:w-auto w-full">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  FIND PLAYERS & VENUES
                </h2>
                <h3 className="text-lg font-semibold text-gray-700">
                  NEARBY
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  To search near from the page Mention,
                  All other elements and layout should remain unchanged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Venues Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Book Venues</h2>
            <Link href="/venues" className="text-blue-600 hover:text-blue-800 font-medium">
              See all venues →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {venues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-medium">Image</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{venue.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm font-medium">{venue.rating}</span>
                        <span className="ml-1 text-sm text-gray-500">({venue.reviews})</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">{venue.price}</span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full w-10 h-10 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Sports</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularSports.map((sport, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">{sport.name}</span>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                    {sport.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
