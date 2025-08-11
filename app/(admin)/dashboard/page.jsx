'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Building, Calendar, Globe, TrendingUp, CheckCircle, Clock, Star, Settings, UserCheck } from 'lucide-react'
import { getAdminStats } from '@/actions/admin-actions'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilityOwners: 0,
    totalAdmins: 0,
    regularUsers: 0,
    totalBookings: 0,
    totalActiveCourts: 0,
    totalFacilities: 0,
    pendingFacilities: 0,
    approvedFacilities: 0,
    facilityApprovalRate: 0,
    recentBookings: 0,
    newUsersLast30Days: 0,
    bookingsLast30Days: 0,
    topFacilities: [],
    userGrowthRate: '0',
    bookingGrowthRate: '0'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const result = await getAdminStats()
      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Failed to fetch statistics')
    } finally {
      setIsLoading(false)
    }
  }
  // admin dashboard implement Link tag to go to the /facility-approval and /user-management page
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Global statistics and platform overview</p>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/facility-approval">
            <Button variant="outline" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Facility Approval
              {stats.pendingFacilities > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.pendingFacilities}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/user-management">
            <Button variant="outline" className="flex items-center gap-2">
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
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersLast30Days} new this month ({stats.userGrowthRate}%)
            </p>
          </CardContent>
        </Card>

        {/* Total Facility Owners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facility Owners</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalFacilityOwners.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFacilities} facilities managed
            </p>
          </CardContent>
        </Card>

        {/* Total Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.bookingsLast30Days} this month ({stats.bookingGrowthRate}%)
            </p>
          </CardContent>
        </Card>

        {/* Total Active Courts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : stats.totalActiveCourts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.approvedFacilities} approved facilities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Facility Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Facility Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approved</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{stats.approvedFacilities}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{stats.pendingFacilities}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approval Rate</span>
              <Badge variant="secondary">
                {stats.facilityApprovalRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Regular Users</span>
              <span className="font-medium">{isLoading ? '...' : stats.regularUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Facility Owners</span>
              <span className="font-medium">{isLoading ? '...' : stats.totalFacilityOwners.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Administrators</span>
              <span className="font-medium">{isLoading ? '...' : stats.totalAdmins.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bookings (7 days)</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{stats.recentBookings}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Users (30 days)</span>
              <span className="font-medium">{stats.newUsersLast30Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Facilities</span>
              <span className="font-medium">{stats.totalFacilities}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Facilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Performing Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : stats.topFacilities.length > 0 ? (
            <div className="space-y-3">
              {stats.topFacilities.map((facility, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{facility.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">• {facility.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{facility.bookingCount} bookings</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
