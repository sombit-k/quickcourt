'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { getFacilitiesByOwner, deleteFacility, deleteCourt } from '@/actions/facility-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star,
  Users,
  Calendar,
  DollarSign,
  Eye,
  Settings,
  TrendingUp,
  Activity,
  CalendarDays,
  IndianRupee
} from 'lucide-react'

export default function FacilityManagementPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [facilities, setFacilities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [deletingFacility, setDeletingFacility] = useState(null)
  const [deletingCourt, setDeletingCourt] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    activeCourts: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    upcomingBookings: []
  })
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Check user role and fetch facilities
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      if (!isLoaded) return
      
      if (!user) {
        toast.error('You must be logged in to access this page')
        router.push('/venue')
        return
      }

      try {
        const response = await fetch('/api/user')
        const userData = await response.json()
        
        if (userData.role !== 'FACILITY_OWNER') {
          toast.error('You must be a facility owner to access this page')
          router.push('/venue')
          return
        }
        
        setUserRole(userData.role)
        await fetchFacilities()
      } catch (error) {
        console.error('Error checking user role:', error)
        toast.error('Error verifying permissions')
        router.push('/venue')
      }
    }

    checkUserAndFetchData()
  }, [user, isLoaded, router])

  const fetchFacilities = async () => {
    try {
      setIsLoading(true)
      const data = await getFacilitiesByOwner()
      setFacilities(data)
      await fetchDashboardData(data)
    } catch (error) {
      console.error('Error fetching facilities:', error)
      toast.error('Failed to load facilities')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardData = async (facilitiesData) => {
    try {
      const response = await fetch('/api/facility/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        // Calculate basic metrics from facilities data as fallback
        const activeCourts = facilitiesData.reduce((sum, facility) => 
          sum + (facility.courts?.filter(court => court.isActive)?.length || 0), 0
        )
        const totalBookings = facilitiesData.reduce((sum, facility) => 
          sum + (facility._count?.bookings || 0), 0
        )
        
        setDashboardData(prev => ({
          ...prev,
          activeCourts,
          totalBookings
        }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleDeleteFacility = async (facilityId) => {
    if (!confirm('Are you sure you want to delete this facility? This action cannot be undone and will delete all associated courts and bookings.')) {
      return
    }

    try {
      setDeletingFacility(facilityId)
      const result = await deleteFacility(facilityId)
      
      if (result.success) {
        toast.success(result.message)
        await fetchFacilities() // Refresh the list
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error deleting facility:', error)
      toast.error('Failed to delete facility')
    } finally {
      setDeletingFacility(null)
    }
  }

  const handleDeleteCourt = async (courtId, facilityId) => {
    if (!confirm('Are you sure you want to delete this court? This action cannot be undone and will cancel all future bookings.')) {
      return
    }

    try {
      setDeletingCourt(courtId)
      const result = await deleteCourt(courtId)
      
      if (result.success) {
        toast.success(result.message)
        await fetchFacilities() // Refresh the list
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error deleting court:', error)
      toast.error('Failed to delete court')
    } finally {
      setDeletingCourt(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      APPROVED: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      SUSPENDED: { color: 'bg-gray-100 text-gray-800', text: 'Suspended' }
    }
    
    const config = statusConfig[status] || statusConfig.PENDING
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  const formatOperatingHours = (hoursString) => {
    try {
      const hours = JSON.parse(hoursString || '{}')
      const today = new Date().toLocaleLowerCase().substring(0, 3) + 'day'
      const todayHours = hours[today]
      
      if (todayHours?.closed) {
        return 'Closed today'
      }
      
      if (todayHours) {
        return `Today: ${todayHours.open} - ${todayHours.close}`
      }
      
      return 'Hours not set'
    } catch {
      return 'Hours not available'
    }
  }

  const formatAmenities = (amenitiesString) => {
    try {
      const amenities = JSON.parse(amenitiesString || '[]')
      return amenities.filter(a => a.trim()).slice(0, 3)
    } catch {
      return []
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (!isLoaded || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center py-50">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Loading your facilities...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              My Facilities
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your sports facilities and courts
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => router.push('/facility/bookings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Booking Requests
            </Button>
            <Button 
              onClick={() => router.push('/facility/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Facility
            </Button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.totalBookings}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courts</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.activeCourts}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Across {facilities.length} facilities</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.monthlyEarnings)}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalEarnings)}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">All time revenue</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Calendar */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Upcoming Bookings
              </CardTitle>
              <Button 
                onClick={() => router.push('/facility/bookings')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Manage Bookings
              </Button>
            </div>
          </CardHeader>
          
        </Card>

        {/* Facilities List */}
        {facilities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No facilities yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first sports facility to start managing bookings
              </p>
              <Button onClick={() => router.push('/facility/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Facility
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{facility.name}</CardTitle>
                        {getStatusBadge(facility.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {facility.city}, {facility.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {facility.rating?.toFixed(1) || '0.0'} ({facility.totalReviews || 0} reviews)
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {facility._count?.bookings || 0} bookings
                        </div>
                      </div>

                      {facility.description && (
                        <p className="text-gray-700 mt-2 line-clamp-2">
                          {facility.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/facility/${facility.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFacility(facility.id)}
                        disabled={deletingFacility === facility.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        {deletingFacility === facility.id ? (
                          'Deleting...'
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Facility Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Contact</h4>
                      {facility.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          {facility.phone}
                        </div>
                      )}
                      {facility.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          {facility.email}
                        </div>
                      )}
                      {facility.website && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="h-4 w-4" />
                          <a href={facility.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Hours</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {formatOperatingHours(facility.operatingHours)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {formatAmenities(facility.amenities).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Courts Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Courts ({facility.courts?.length || 0})
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/facility/${facility.id}/courts/new`)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Court
                      </Button>
                    </div>

                    {facility.courts?.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No courts added yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/facility/${facility.id}/courts/new`)}
                        >
                          Add Your First Court
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {facility.courts.map((court) => (
                          <Card key={court.id} className="bg-gray-50">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h5 className="font-medium">{court.name}</h5>
                                  <Badge variant="outline" className="mt-1">
                                    {court.sportType}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push(`/facility/${facility.id}/courts/${court.id}/edit`)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCourt(court.id, facility.id)}
                                    disabled={deletingCourt === court.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    {deletingCourt === court.id ? (
                                      '...'
                                    ) : (
                                      <Trash2 className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <DollarSign className="h-4 w-4" />
                                ₹{court.pricePerHour}/hour
                              </div>
                              
                              {court.description && (
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {court.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  court.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {court.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/book/${court.id}`)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {facility.status === 'REJECTED' && facility.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-1">Rejection Reason</h5>
                      <p className="text-sm text-red-700">{facility.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}