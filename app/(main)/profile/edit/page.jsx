"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, User, Mail, Phone, Lock, Save, X, Eye, EyeOff } from 'lucide-react'
import { getCurrentUser } from '@/actions/user-sync'
import { updateUserProfile, changePassword } from '@/actions/profile-actions'
import Link from 'next/link'

const EditProfilePage = () => {
  const router = useRouter()
  const { user: clerkUser, isLoaded } = useUser()
  
  // State management
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })

  // Form data
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoaded && clerkUser) {
        try {
          setLoading(true)
          const userData = await getCurrentUser(clerkUser.id)
          setUserData(userData)
          
          // Populate form with existing data
          setProfileForm({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || ''
          })
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

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setChangingPassword(true)
    setError('')
    setSuccessMessage('')

    try {
      const formData = new FormData()
      formData.append('oldPassword', passwordForm.oldPassword)
      formData.append('newPassword', passwordForm.newPassword)
      formData.append('confirmPassword', passwordForm.confirmPassword)

      const result = await changePassword(formData)
      
      if (result.success) {
        setSuccessMessage('Password changed successfully!')
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setChangingPassword(false)
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
          
          {/* Left Sidebar - User Avatar */}
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
                  Update your profile information
                </p>

                <Button variant="outline" size="sm" disabled>
                  Change Avatar
                  <span className="text-xs text-gray-400 ml-2">(Coming Soon)</span>
                </Button>
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
                    💡 Profile changes are saved to your QuickCourt account. Some fields may sync with your authentication provider.
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
                          firstName: userData.firstName || '',
                          lastName: userData.lastName || '',
                          email: userData.email || '',
                          phone: userData.phone || ''
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

            {/* Password Change Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 Note: Changes to your name will be reflected in this app. For account security settings like email and password, please use your Clerk account settings.
                  </p>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="oldPassword"
                        type={showPasswords.old ? "text" : "password"}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
                      >
                        {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="outline" disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost"
                      onClick={() => setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })}
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfilePage
