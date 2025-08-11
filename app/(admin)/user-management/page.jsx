'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Ban, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  Building,
  Settings
} from 'lucide-react'
import { getAllUsers, toggleUserStatus, getUserBookingHistory } from '@/actions/admin-actions'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [userBookings, setUserBookings] = useState([])
  const [bookingPagination, setBookingPagination] = useState({})
  const [bookingPage, setBookingPage] = useState(1)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, statusFilter, currentPage])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const result = await getAllUsers(searchTerm, roleFilter, statusFilter, currentPage, 10)
      if (result.success) {
        setUsers(result.data.users)
        setPagination(result.data.pagination)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserBookings = async (userId, page = 1) => {
    try {
      const result = await getUserBookingHistory(userId, page, 5)
      if (result.success) {
        setUserBookings(result.data.bookings)
        setBookingPagination(result.data.pagination)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      setError('Failed to fetch user bookings')
    }
  }

  const handleUserStatusToggle = async (userId, currentIsBanned) => {
    setIsUpdating(true)
    try {
      const result = await toggleUserStatus(userId, currentIsBanned)
      if (result.success) {
        // Refresh users list
        await fetchUsers()
        // Show success message or toast here if you have a toast system
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
      setError('Failed to update user status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewBookings = async (user) => {
    setSelectedUser(user)
    setBookingPage(1)
    await fetchUserBookings(user.id, 1)
  }

  const handleBookingPageChange = async (newPage) => {
    setBookingPage(newPage)
    await fetchUserBookings(selectedUser.id, newPage)
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'FACILITY_OWNER':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusBadgeColor = (isBanned) => {
    return isBanned ? 'destructive' : 'default'
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-30">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading User Management</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // Booking History View
  if (selectedUser) {
    return (
      <div className="container mx-auto px-4 py-8 pt-30">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedUser(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Booking History - {selectedUser.firstName} {selectedUser.lastName}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedUser.email} • {selectedUser.role}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking History ({bookingPagination.totalCount || 0} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {userBookings.length > 0 ? (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{booking.court.facility.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.court.facility.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {booking.timeSlot}
                          </div>
                        </div>
                        <p className="text-sm">
                          Court: {booking.court.name} • Type: {booking.court.sportType}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <p className="text-lg font-semibold mt-2">₹{booking.totalAmount}</p>
                        <p className="text-xs text-gray-500">
                          Booked: {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Booking Pagination */}
                {bookingPagination.totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <p className="text-sm text-gray-600">
                      Page {bookingPagination.currentPage} of {bookingPagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookingPageChange(bookingPage - 1)}
                        disabled={!bookingPagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookingPageChange(bookingPage + 1)}
                        disabled={!bookingPagination.hasNext}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No bookings found for this user</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users, roles, and access permissions</p>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/facility-approval">
            <Button variant="outline" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Facility Approval
            </Button>
          </Link>
          <Link href="/user-management">
            <Button variant="default" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              User Management
            </Button>
          </Link>
          <Link href="/role-requests">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Role Requests
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

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="USER">Users</SelectItem>
                <SelectItem value="FACILITY_OWNER">Facility Owners</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({pagination.totalCount || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge variant={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge variant={getStatusBadgeColor(user.isBanned)}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Bookings: {user._count.bookings}</span>
                        {user.role === 'FACILITY_OWNER' && (
                          <span>Facilities: {user._count.facilities}</span>
                        )}
                        <span>Joined: {formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBookings(user)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Bookings
                      </Button>
                      {user.role !== 'ADMIN' && (
                        <Button
                          variant={user.isBanned ? "default" : "destructive"}
                          size="sm"
                          onClick={() => handleUserStatusToggle(user.id, user.isBanned)}
                          disabled={isUpdating}
                        >
                          {user.isBanned ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-1" />
                              Ban
                            </>
                          )}
                        </Button>
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
            <p className="text-gray-500 text-center py-8">No users found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
