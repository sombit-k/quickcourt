"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, User, Mail, Phone, Save, X, RefreshCw, Settings, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react'
import { getCurrentUser, syncUser } from '@/actions/user-sync'
import { updateUserProfile } from '@/actions/profile-actions'
import { submitRoleRequest, getUserRoleRequests } from '@/actions/role-request-actions'
import { toast } from 'sonner'
import Link from 'next/link'

const EditProfilePage = () => {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  
  // State management
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [roleRequests, setRoleRequests] = useState([])
  const [showRoleRequestForm, setShowRoleRequestForm] = useState(false)
  const [roleRequestForm, setRoleRequestForm] = useState({
    requestedRole: '',
    reason: ''
  })
  const [submittingRoleRequest, setSubmittingRoleRequest] = useState(false)

  // Form data
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'USER'
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && clerkUser) {
        try {
          setLoading(true)
          let userData = await getCurrentUser(clerkUser.id)
          
          // If user doesn't exist in database, create them
          if (!userData || !userData.id) {
            await handleSyncUser()
            userData = await getCurrentUser(clerkUser.id)
          }
          
          setUserData(userData)
          
          // Populate form with existing data
          setProfileForm({
            firstName: userData.firstName || clerkUser.firstName || '',
            lastName: userData.lastName || clerkUser.lastName || '',
            email: userData.email || clerkUser.emailAddresses?.[0]?.emailAddress || '',
            phone: userData.phone || '',
            role: userData.role || 'USER'
          })

          // Load user's role requests
          await loadRoleRequests()
        } catch (err) {
          console.error('Error fetching user data:', err)
          setError('Failed to load user profile')
        } finally {
          setLoading(false)
        }
      } else if (isLoaded && !clerkUser) {
        setLoading(false)
        setError('User not authenticated')
      }
    }

    fetchUserData()
  }, [clerkUser, isLoaded])

  // Handle user sync from Clerk to database
  const handleSyncUser = async () => {
    if (!clerkUser) return
    
    setSyncing(true)
    setError('')
    setSuccessMessage('')

    try {
      const syncData = {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        firstName: clerkUser.firstName || profileForm.firstName || 'User',
        lastName: clerkUser.lastName || profileForm.lastName || '',
        fullName: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        avatar: clerkUser.imageUrl,
        role: profileForm.role || 'USER'
      }

      const syncedUser = await syncUser(syncData)
      setUserData(syncedUser)
      setSuccessMessage('User data synced successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error syncing user:', err)
      setError('Failed to sync user data')
    } finally {
      setSyncing(false)
    }
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('firstName', profileForm.firstName)
      formData.append('lastName', profileForm.lastName)
      formData.append('email', profileForm.email)
      formData.append('phone', profileForm.phone)

      const result = await updateUserProfile(formData)
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully!')
        setUserData(result.user)
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Load user's role requests
  const loadRoleRequests = async () => {
    try {
      const result = await getUserRoleRequests()
      if (result.success) {
        setRoleRequests(result.data)
      }
    } catch (err) {
      console.error('Error loading role requests:', err)
    }
  }

  // Handle role change (show role request form if needed)
  const handleRoleChange = (value) => {
    if (value !== userData?.role && value === 'FACILITY_OWNER') {
      // Check if there's already a pending request
      const pendingRequest = roleRequests.find(
        req => req.requestedRole === 'FACILITY_OWNER' && req.status === 'PENDING'
      )
      
      if (pendingRequest) {
        toast.info('You already have a pending request for Facility Owner role')
        return
      }

      // Show role request form
      setRoleRequestForm({
        requestedRole: 'FACILITY_OWNER',
        reason: ''
      })
      setShowRoleRequestForm(true)
    } else {
      // For USER role, update directly (downgrade)
      setProfileForm(prev => ({ ...prev, role: value }))
    }
  }

  // Submit role request
  const handleRoleRequestSubmit = async (e) => {
    e.preventDefault()
    setSubmittingRoleRequest(true)

    try {
      const result = await submitRoleRequest(
        roleRequestForm.requestedRole,
        roleRequestForm.reason
      )

      if (result.success) {
        toast.success('Role request submitted successfully!', {
          description: 'An admin will review your request and get back to you.'
        })
        setShowRoleRequestForm(false)
        setRoleRequestForm({ requestedRole: '', reason: '' })
        await loadRoleRequests() // Refresh role requests
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      toast.error('Failed to submit role request')
    } finally {
      setSubmittingRoleRequest(false)
    }
  }

  // Get status badge color
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

  // Get status icon
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

  // Display loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  // Display error state
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const user = {
    name: userData && userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData?.fullName 
      ? userData.fullName
      : clerkUser 
      ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User'
      : 'User',
    avatar: userData?.avatar || clerkUser?.imageUrl || ""
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar - User Avatar & Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {user.name}
                </h2>
                
                <p className="text-sm text-gray-500 mb-4">
                  {userData?.email || clerkUser?.emailAddresses?.[0]?.emailAddress}
                </p>

                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSyncUser}
                    disabled={syncing}
                    className="w-full"
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync from Clerk
                      </>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>User ID: {userData?.id || 'Not synced'}</p>
                    <p>Clerk ID: {clerkUser?.id}</p>
                    <p>Role: {userData?.role || 'USER'}</p>
                    {/* <p>Verified: {userData?.isVerified ? '✅' : '❌'}</p> */}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Content - Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Information Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 This form contains all the advanced profile management features. Changes are saved to your QuickCourt database.
                  </p>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Account Type</Label>
                    <Select 
                      value={profileForm.role} 
                      onValueChange={(value) => handleRoleChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Regular User</SelectItem>
                        <SelectItem value="FACILITY_OWNER">Facility Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Want to become a facility owner? Submit a request for admin approval.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setProfileForm({
                          firstName: userData?.firstName || clerkUser?.firstName || '',
                          lastName: userData?.lastName || clerkUser?.lastName || '',
                          email: userData?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || '',
                          phone: userData?.phone || '',
                          role: userData?.role || 'USER'
                        })
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Authentication Settings</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Manage your password, email verification, and two-factor authentication through Clerk.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://accounts.clerk.dev" target="_blank" rel="noopener noreferrer">
                          <Settings className="w-4 h-4 mr-2" />
                          Clerk Settings
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">Data Sync Status</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Keep your QuickCourt profile synchronized with your authentication account.
                        </p>
                      </div>
                      <div className="flex items-center text-sm">
                        {userData?.id ? (
                          <span className="flex items-center text-green-600">
                            <UserCheck className="w-4 h-4 mr-1" />
                            Synced
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-600">
                            <X className="w-4 h-4 mr-1" />
                            Not Synced
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">Profile Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Member since:</span>
                        <br />
                        <span className="font-medium">
                          {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last login:</span>
                        <br />
                        <span className="font-medium">
                          {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Role Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleRequests.length > 0 ? (
                    <div className="space-y-3">
                      {roleRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">
                                  {request.requestedRole === 'FACILITY_OWNER' ? 'Facility Owner' : request.requestedRole}
                                </h4>
                                <Badge variant={getStatusBadgeColor(request.status)} className="flex items-center gap-1">
                                  {getStatusIcon(request.status)}
                                  {request.status}
                                </Badge>
                              </div>
                              {request.reason && (
                                <p className="text-sm text-gray-600">
                                  <strong>Reason:</strong> {request.reason}
                                </p>
                              )}
                              {request.adminComments && (
                                <p className="text-sm text-gray-600">
                                  <strong>Admin Comments:</strong> {request.adminComments}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Submitted on {new Date(request.createdAt).toLocaleDateString()}
                                {request.reviewedAt && (
                                  <> • Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No role requests submitted yet.
                    </p>
                  )}
                  
                  {userData?.role === 'USER' && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const pendingRequest = roleRequests.find(
                            req => req.requestedRole === 'FACILITY_OWNER' && req.status === 'PENDING'
                          )
                          
                          if (pendingRequest) {
                            toast.info('You already have a pending request for Facility Owner role')
                            return
                          }

                          setRoleRequestForm({
                            requestedRole: 'FACILITY_OWNER',
                            reason: ''
                          })
                          setShowRoleRequestForm(true)
                        }}
                        className="w-full"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Request Facility Owner Role
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Role Request Modal */}
        {showRoleRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Request {roleRequestForm.requestedRole === 'FACILITY_OWNER' ? 'Facility Owner' : roleRequestForm.requestedRole} Role
              </h3>
              <form onSubmit={handleRoleRequestSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for Request *</Label>
                  <Textarea
                    id="reason"
                    value={roleRequestForm.reason}
                    onChange={(e) => setRoleRequestForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Please explain why you want to become a facility owner..."
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Provide details about your experience and why you want this role.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRoleRequestForm(false)
                      setRoleRequestForm({ requestedRole: '', reason: '' })
                    }}
                    disabled={submittingRoleRequest}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingRoleRequest || !roleRequestForm.reason.trim()}>
                    {submittingRoleRequest ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditProfilePage
//         try {
//           setLoading(true)
//           const userData = await getCurrentUser(clerkUser.id)
//           setUserData(userData)
          
//           // Populate form with existing data
//           setProfileForm({
//             firstName: userData.firstName || '',
//             lastName: userData.lastName || '',
//             email: userData.email || '',
//             phone: userData.phone || ''
//           })
//         } catch (err) {
//           console.error('Error fetching user data:', err)
//           setError('Failed to load user profile')
//         } finally {
//           setLoading(false)
//         }
//       } else if (isLoaded && !clerkUser) {
//         setLoading(false)
//         setError('User not authenticated')
//       }
//     }

//     fetchUserData()
//   }, [clerkUser, isLoaded])

//   // Handle profile form submission
//   const handleProfileSubmit = async (e) => {
//     e.preventDefault()
//     setSaving(true)
//     setError('')
//     setSuccessMessage('')

//     try {
//       const formData = new FormData()
//       formData.append('firstName', profileForm.firstName)
//       formData.append('lastName', profileForm.lastName)
//       formData.append('email', profileForm.email)
//       formData.append('phone', profileForm.phone)

//       const result = await updateUserProfile(formData)
      
//       if (result.success) {
//         setSuccessMessage('Profile updated successfully!')
//         setUserData(result.user)
//         setTimeout(() => setSuccessMessage(''), 3000)
//       } else {
//         setError(result.message)
//       }
//     } catch (err) {
//       setError('Failed to update profile')
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Handle password form submission
//   const handlePasswordSubmit = async (e) => {
//     e.preventDefault()
//     setChangingPassword(true)
//     setError('')
//     setSuccessMessage('')

//     try {
//       const formData = new FormData()
//       formData.append('oldPassword', passwordForm.oldPassword)
//       formData.append('newPassword', passwordForm.newPassword)
//       formData.append('confirmPassword', passwordForm.confirmPassword)

//       const result = await changePassword(formData)
      
//       if (result.success) {
//         setSuccessMessage('Password changed successfully!')
//         setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
//         setTimeout(() => setSuccessMessage(''), 3000)
//       } else {
//         setError(result.message)
//       }
//     } catch (err) {
//       setError('Failed to change password')
//     } finally {
//       setChangingPassword(false)
//     }
//   }

//   // Display loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
//           <p>Loading profile...</p>
//         </div>
//       </div>
//     )
//   }

//   // Display error state
//   if (error && !userData) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error}</p>
//           <Button onClick={() => window.location.reload()}>
//             Try Again
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   const user = {
//     name: userData && userData.firstName && userData.lastName 
//       ? `${userData.firstName} ${userData.lastName}` 
//       : userData?.fullName 
//       ? userData.fullName
//       : clerkUser 
//       ? `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.fullName || 'User'
//       : 'User',
//     avatar: userData?.avatar || clerkUser?.imageUrl || ""
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 pt-20">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center mb-6">
//           <Link href="/profile">
//             <Button variant="ghost" size="sm" className="mr-4">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Profile
//             </Button>
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
//         </div>

//         {/* Messages */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-600">{error}</p>
//           </div>
//         )}

//         {successMessage && (
//           <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//             <p className="text-green-600">{successMessage}</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Left Sidebar - User Avatar */}
//           <div className="lg:col-span-1">
//             <Card className="p-6">
//               <div className="text-center">
//                 <Avatar className="w-24 h-24 mx-auto mb-4">
//                   <AvatarImage src={user.avatar} alt={user.name} />
//                   <AvatarFallback className="text-xl font-semibold">
//                     {user.name.split(' ').map(n => n[0]).join('')}
//                   </AvatarFallback>
//                 </Avatar>
                
//                 <h2 className="text-lg font-semibold text-gray-900 mb-2">
//                   {user.name}
//                 </h2>
                
//                 <p className="text-sm text-gray-500 mb-4">
//                   Update your profile information
//                 </p>

//                 <Button variant="outline" size="sm" disabled>
//                   Change Avatar
//                   <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span>
//                 </Button>
//               </div>
//             </Card>
//           </div>

//           {/* Right Content - Edit Forms */}
//           <div className="lg:col-span-2 space-y-6">
            
//             {/* Profile Information Form */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <User className="w-5 h-5 mr-2" />
//                   Profile Information
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-sm text-blue-700">
//                     💡 Profile changes are saved to your QuickCourt account. Some fields may sync with your authentication provider.
//                   </p>
//                 </div>
                
//                 <form onSubmit={handleProfileSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="firstName">First Name *</Label>
//                       <Input
//                         id="firstName"
//                         type="text"
//                         value={profileForm.firstName}
//                         onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
//                         placeholder="Enter your first name"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="lastName">Last Name *</Label>
//                       <Input
//                         id="lastName"
//                         type="text"
//                         value={profileForm.lastName}
//                         onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
//                         placeholder="Enter your last name"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <Label htmlFor="email">Email Address *</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={profileForm.email}
//                       onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
//                       placeholder="Enter your email address"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <Label htmlFor="phone">Phone Number</Label>
//                     <Input
//                       id="phone"
//                       type="tel"
//                       value={profileForm.phone}
//                       onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
//                       placeholder="Enter your phone number"
//                     />
//                   </div>

//                   <div className="flex gap-3 pt-4">
//                     <Button type="submit" disabled={saving}>
//                       {saving ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Saving...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="w-4 h-4 mr-2" />
//                           Save Changes
//                         </>
//                       )}
//                     </Button>
//                     <Button 
//                       type="button" 
//                       variant="outline"
//                       onClick={() => {
//                         setProfileForm({
//                           firstName: userData.firstName || '',
//                           lastName: userData.lastName || '',
//                           email: userData.email || '',
//                           phone: userData.phone || ''
//                         })
//                       }}
//                     >
//                       <X className="w-4 h-4 mr-2" />
//                       Reset
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>

//             {/* Password Change Form */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center">
//                   <Lock className="w-5 h-5 mr-2" />
//                   Change Password
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                   <p className="text-sm text-blue-700">
//                     💡 Note: Changes to your name will be reflected in this app. For account security settings like email and password, please use your Clerk account settings.
//                   </p>
//                 </div>
                
//                 <form onSubmit={handlePasswordSubmit} className="space-y-4">
//                   <div>
//                     <Label htmlFor="oldPassword">Current Password</Label>
//                     <div className="relative">
//                       <Input
//                         id="oldPassword"
//                         type={showPasswords.old ? "text" : "password"}
//                         value={passwordForm.oldPassword}
//                         onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
//                         placeholder="Enter your current password"
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//                         onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
//                       >
//                         {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </Button>
//                     </div>
//                   </div>

//                   <div>
//                     <Label htmlFor="newPassword">New Password</Label>
//                     <div className="relative">
//                       <Input
//                         id="newPassword"
//                         type={showPasswords.new ? "text" : "password"}
//                         value={passwordForm.newPassword}
//                         onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
//                         placeholder="Enter your new password"
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//                         onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
//                       >
//                         {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </Button>
//                     </div>
//                   </div>

//                   <div>
//                     <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                     <div className="relative">
//                       <Input
//                         id="confirmPassword"
//                         type={showPasswords.confirm ? "text" : "password"}
//                         value={passwordForm.confirmPassword}
//                         onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
//                         placeholder="Confirm your new password"
//                         required
//                       />
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//                         onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
//                       >
//                         {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="flex gap-3 pt-4">
//                     <Button type="submit" variant="outline" disabled={changingPassword}>
//                       {changingPassword ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Changing...
//                         </>
//                       ) : (
//                         <>
//                           <Lock className="w-4 h-4 mr-2" />
//                           Change Password
//                         </>
//                       )}
//                     </Button>
//                     <Button 
//                       type="button" 
//                       variant="ghost"
//                       onClick={() => setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })}
//                     >
//                       Clear
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>

//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default EditProfilePage
