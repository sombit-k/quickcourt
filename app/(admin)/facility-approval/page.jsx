'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Clock,
  Users,
  Check, 
  X, 
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  Settings
} from 'lucide-react'
import { getPendingFacilities, approveFacility, rejectFacility } from '@/actions/admin-actions'

export default function FacilityApproval() {
  const [facilities, setFacilities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchPendingFacilities()
  }, [currentPage])

  const fetchPendingFacilities = async () => {
    try {
      setIsLoading(true)
      const result = await getPendingFacilities(currentPage, 5)
      if (result.success) {
        setFacilities(result.data.facilities)
        setPagination(result.data.pagination)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching pending facilities:', error)
      setError('Failed to fetch pending facilities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveFacility = async (facilityId) => {
    setIsProcessing(true)
    try {
      const result = await approveFacility(facilityId)
      if (result.success) {
        // Refresh the list
        await fetchPendingFacilities()
        // Show success message or toast here if you have a toast system
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error approving facility:', error)
      setError('Failed to approve facility')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectFacility = async (facilityId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    setIsProcessing(true)
    try {
      const result = await rejectFacility(facilityId, rejectionReason)
      if (result.success) {
        // Refresh the list
        await fetchPendingFacilities()
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedFacility(null)
        // Show success message or toast here if you have a toast system
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error rejecting facility:', error)
      setError('Failed to reject facility')
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectModal = (facility) => {
    setSelectedFacility(facility)
    setShowRejectModal(true)
    setRejectionReason('')
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatOperatingHours = (operatingHours) => {
    try {
      // Handle case where operatingHours might be a string, null, or undefined
      let parsedHours = operatingHours
      
      if (typeof operatingHours === 'string') {
        parsedHours = JSON.parse(operatingHours)
      }
      
      if (!parsedHours || typeof parsedHours !== 'object' || Object.keys(parsedHours).length === 0) {
        return 'Not specified'
      }

      const days = Object.entries(parsedHours)
      const openDays = days.filter(([day, hours]) => hours && !hours.closed)
      
      if (openDays.length === 0) {
        return 'Closed all days'
      }

      // Check if all open days have same hours
      const firstOpenDay = openDays[0][1]
      const allSameHours = openDays.every(([day, hours]) => 
        hours && hours.open === firstOpenDay.open && hours.close === firstOpenDay.close
      )

      if (allSameHours && openDays.length === 7) {
        return `Daily: ${firstOpenDay.open} - ${firstOpenDay.close}`
      }

      return `${firstOpenDay.open} - ${firstOpenDay.close} (varies by day)`
    } catch (error) {
      console.error('Error formatting operating hours:', error)
      return 'Invalid format'
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Facility Approval</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // Rejection Modal
  if (showRejectModal && selectedFacility) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            Reject Facility: {selectedFacility.name}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Rejection Reason *
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection..."
              rows={4}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setSelectedFacility(null)
                setRejectionReason('')
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectFacility(selectedFacility.id)}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Facility'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Facility Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve pending facility registrations</p>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/facility-approval">
            <Button variant="default" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Facility Approval
            </Button>
          </Link>
          <Link href="/user-management">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              User Management
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Facilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Pending Facilities ({pagination.totalCount || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading pending facilities...</p>
            </div>
          ) : facilities.length > 0 ? (
            <div className="space-y-6">
              {facilities.map((facility) => (
                <div key={facility.id} className="border rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column - Basic Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold">{facility.name}</h3>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{facility.description}</p>
                      </div>

                      {/* Contact & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{facility.address}, {facility.city}, {facility.state}</span>
                          </div>
                          {facility.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{facility.phone}</span>
                            </div>
                          )}
                          {facility.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4" />
                              <span>{facility.email}</span>
                            </div>
                          )}
                          {facility.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4" />
                              <span>{facility.website}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{formatOperatingHours(facility.operatingHours)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {formatDate(facility.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sports Types */}
                      <div>
                        <h4 className="font-medium mb-2">Sports Types:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(facility.sportsTypes) && facility.sportsTypes.map((sport, index) => (
                            <Badge key={index} variant="outline">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Amenities */}
                      {Array.isArray(facility.amenities) && facility.amenities.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Amenities:</h4>
                          <div className="flex flex-wrap gap-2">
                            {facility.amenities.map((amenity, index) => (
                              <Badge key={index} variant="secondary">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Courts */}
                      <div>
                        <h4 className="font-medium mb-2">Courts ({Array.isArray(facility.courts) ? facility.courts.length : 0}):</h4>
                        <div className="space-y-2">
                          {Array.isArray(facility.courts) && facility.courts.map((court, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{court.name}</span>
                                <span className="text-gray-600 ml-2">• {court.sportType}</span>
                              </div>
                              <span className="text-green-600 font-semibold">
                                ₹{court.pricePerHour}/hr
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="bg-blue-50 p-3 rounded">
                        <h4 className="font-medium mb-2">Owner Information:</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Name:</span> {facility.owner.firstName} {facility.owner.lastName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {facility.owner.email}
                          </div>
                          {facility.owner.phone && (
                            <div>
                              <span className="font-medium">Phone:</span> {facility.owner.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleApproveFacility(facility.id)}
                          disabled={isProcessing}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Approve Facility'}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          onClick={() => openRejectModal(facility)}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject Facility
                        </Button>
                      </div>

                      {/* Images Preview */}
                      {Array.isArray(facility.images) && facility.images.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Images:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {facility.images.slice(0, 4).map((image, index) => (
                              <div key={index} className="aspect-square bg-gray-100 rounded border">
                                <img
                                  src={image}
                                  alt={`Facility ${index + 1}`}
                                  className="w-full h-full object-cover rounded"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {facility.images.length > 4 && (
                            <p className="text-xs text-gray-500 mt-1">
                              +{facility.images.length - 4} more images
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Facilities</h3>
              <p className="text-gray-600">All facilities have been reviewed. Great job!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
