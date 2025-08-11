"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, Filter, Heart, Clock, Users, Wifi, Car, Coffee, Loader } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllVenues, searchVenues, getAvailableSports, getAvailableLocations } from '@/actions/venue-actions';
import Link from 'next/link';

const page = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [venueType, setVenueType] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [availableSports, setAvailableSports] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [error, setError] = useState(null);

  const itemsPerPage = 9;

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [venuesData, sportsData, locationsData] = await Promise.all([
          getAllVenues(sortBy),
          getAvailableSports(),
          getAvailableLocations()
        ]);
        
        setVenues(venuesData);
        setAvailableSports(sportsData);
        setAvailableLocations(locationsData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load venues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [sortBy]);

  // Search and filter function
  const handleSearch = useCallback(async () => {
    try {
      setSearchLoading(true);
      setError(null);
      
      // If no filters are applied, get all venues with current sort
      const hasFilters = searchQuery.trim() || selectedLocation || selectedSports.length > 0 || priceRange || venueType;
      
      if (!hasFilters) {
        const allVenues = await getAllVenues(sortBy);
        setVenues(allVenues);
      } else {
        const filters = {
          searchQuery: searchQuery.trim(),
          location: selectedLocation,
          sports: selectedSports,
          venueType,
          priceRange,
          sortBy
        };

        const searchResults = await searchVenues(filters);
        setVenues(searchResults);
      }
      
      setCurrentPage(1); // Reset to first page
    } catch (err) {
      console.error('Error searching venues:', err);
      setError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, selectedLocation, selectedSports, venueType, priceRange, sortBy]);

  // Auto-search when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedLocation, selectedSports, venueType, priceRange, loading, handleSearch]);

  // Separate effect for sort changes (immediate, no debounce)
  useEffect(() => {
    if (!loading && !searchLoading) {
      handleSearch();
    }
  }, [sortBy]);

  const handleSportChange = (sport, checked) => {
    if (checked) {
      setSelectedSports([...selectedSports, sport]);
    } else {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    }
  };

  const clearFilters = async () => {
    setSearchQuery('');
    setSelectedLocation('');
    setSelectedSports([]);
    setPriceRange('');
    setVenueType('');
    setSortBy('rating');
    
    // Load all venues after clearing filters
    try {
      setSearchLoading(true);
      const allVenues = await getAllVenues('rating');
      setVenues(allVenues);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError('Failed to load venues. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(venues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVenues = venues.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (minPrice, maxPrice) => {
    if (minPrice === maxPrice) {
      return `₹${minPrice}/hr`;
    }
    return `₹${minPrice}-${maxPrice}/hr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-25">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Venues</h1>
          <p className="text-gray-600">Discover and Book Nearby Venues</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Search by venue name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by venue name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search for venue"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter by location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by location
                  </label>
                  <Select value={selectedLocation || "all"} onValueChange={(value) => setSelectedLocation(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {availableLocations.map((location) => (
                        <SelectItem key={location.city} value={location.city}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price range (per hour)
                  </label>
                  <Select value={priceRange || "all"} onValueChange={(value) => setPriceRange(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                      <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                      <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                      <SelectItem value="2000+">₹2000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sports */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sports ({selectedSports.length} selected)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableSports.map((sport) => (
                      <div key={sport} className="flex items-center space-x-2">
                        <Checkbox
                          id={sport}
                          checked={selectedSports.includes(sport)}
                          onCheckedChange={(checked) => handleSportChange(sport, checked)}
                        />
                        <label htmlFor={sport} className="text-sm text-gray-700 capitalize">
                          {sport}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSearch}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Apply Filters'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  Showing {currentVenues.length} of {venues.length} venues
                  {selectedSports.length > 0 && (
                    <span className="ml-2">
                      for {selectedSports.join(', ')}
                    </span>
                  )}
                </p>
                {error && (
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Venue Grid */}
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
            ) : currentVenues.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentVenues.map((venue) => (
                  <Card key={venue.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {venue.images && venue.images.length > 0 ? (
                          <img 
                            src={venue.images[0]} 
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-4xl font-bold opacity-50">
                            {venue.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{venue.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({venue.totalReviews})</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {venue.city}, {venue.state}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {venue.sportsTypes.slice(0, 2).map((sport) => (
                          <Badge key={sport} variant="secondary" className="text-xs capitalize">
                            {sport}
                          </Badge>
                        ))}
                        {venue.sportsTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{venue.sportsTypes.length - 2} more
                          </Badge>
                        )}
                        {venue.amenities.slice(0, 1).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(venue.minPrice, venue.maxPrice)}
                        </span>
                        <Link href={`/venue/${venue.id}`}>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white px-4"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  &lt;
                </Button>
                
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 p-0 ${pageNum === currentPage ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-8 h-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  &gt;
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;