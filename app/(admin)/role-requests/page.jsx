'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  UserCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building,
  Settings
} from 'lucide-react'
import { getAllRoleRequests, approveRoleRequest, rejectRoleRequest } from '@/actions/role-request-actions'

export default function RoleRequestManagement() {
  const [roleRequests, setRoleRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [adminComments, setAdminComments] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    fetchRoleRequests()
  }, [statusFilter, currentPage])

  const fetchRoleRequests = async () => {
    try {
      setIsLoading(true)
      const result = await getAllRoleRequests(currentPage, 10, statusFilter)
      if (result.success) {
        setRoleRequests(result.data.roleRequests)
        setPagination(result.data.pagination)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error fetching role requests:', error)
      setError('Failed to fetch role requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveRequest = async (requestId) => {
    setIsProcessing(true)
    try {
      const result = await approveRoleRequest(requestId, adminComments)
      if (result.success) {
        // Refresh the list
        await fetchRoleRequests()
        setAdminComments('')
        // Show success message or toast here if you have a toast system
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error approving role request:', error)
      setError('Failed to approve role request')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectRequest = async (requestId) => {
    if (!adminComments.trim()) {
      setError('Please provide rejection comments')
      return
    }

    setIsProcessing(true)
    try {
      const result = await rejectRoleRequest(requestId, adminComments)
      if (result.success) {
        // Refresh the list
        await fetchRoleRequests()
        setShowRejectModal(false)
        setAdminComments('')
        setSelectedRequest(null)
        // Show success message or toast here if you have a toast system
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Error rejecting role request:', error)
      setError('Failed to reject role request')
    } finally {
      setIsProcessing(false)
    }
  }

  const openRejectModal = (request) => {
    setSelectedRequest(request)
    setShowRejectModal(true)
    setAdminComments('')
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'APPROVED':
        return 'default'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3 h-3" />
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3" />
      case 'REJECTED':
        return <XCircle className="w-3 h-3" />
      default:
        return null
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-30">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Role Requests</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  // Reject Modal
  if (showRejectModal && selectedRequest) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold mb-4">
            Reject Role Request: {selectedRequest.user.firstName} {selectedRequest.user.lastName}
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Rejection Comments *
            </label>
            <Textarea
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder="Please provide clear feedback for the rejection..."
              rows={4}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setSelectedRequest(null)
                setAdminComments('')
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleRejectRequest(selectedRequest.id)}
              disabled={isProcessing || !adminComments.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-30">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Role Request Management</h1>
        <p className="text-gray-600 mt-2">Review and manage user role requests</p>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/user-management">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              User Management
            </Button>
          </Link>
          <Link href="/facility-approval">
            <Button variant="outline" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Facility Approval
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Role Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Role Requests ({pagination.totalCount || 0} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading role requests...</p>
            </div>
          ) : roleRequests.length > 0 ? (
            <div className="space-y-6">
              {roleRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column - Request Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {request.user.firstName} {request.user.lastName}
                            </h3>
                            <p className="text-gray-600">{request.user.email}</p>
                          </div>
                          <Badge variant={getStatusBadgeColor(request.status)} className="flex items-center gap-1">
                            {getStatusIcon(request.status)}
                            {request.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700">Requested Role:</h4>
                          <p className="text-lg font-semibold text-blue-600">
                            {request.requestedRole === 'FACILITY_OWNER' ? 'Facility Owner' : request.requestedRole}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-gray-700">Current Role:</h4>
                          <p>{request.user.role}</p>
                        </div>

                        {request.reason && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Reason:</h4>
                            <p className="text-gray-600">{request.reason}</p>
                          </div>
                        )}

                        {request.adminComments && (
                          <div>
                            <h4 className="font-medium text-sm text-gray-700">Admin Comments:</h4>
                            <p className="text-gray-600">{request.adminComments}</p>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          <p>Submitted: {formatDate(request.createdAt)}</p>
                          {request.reviewedAt && (
                            <p>Reviewed: {formatDate(request.reviewedAt)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    {request.status === 'PENDING' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Admin Comments (Optional)
                          </label>
                          <Textarea
                            value={adminComments}
                            onChange={(e) => setAdminComments(e.target.value)}
                            placeholder="Add comments about this request..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-3">
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isProcessing}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {isProcessing ? 'Processing...' : 'Approve Request'}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={() => openRejectModal(request)}
                            disabled={isProcessing}
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject Request
                          </Button>
                        </div>
                      </div>
                    )}
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
            <p className="text-gray-500 text-center py-8">No role requests found</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
