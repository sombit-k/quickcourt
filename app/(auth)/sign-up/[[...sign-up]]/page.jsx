"use client";

import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeOffIcon, Upload } from 'lucide-react'

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Handle the submission of the sign-up form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isLoaded) return

    setLoading(true)
    // Reset errors
    setErrors({})

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      setLoading(false)
      return
    }

    // Validate role is selected
    if (!role) {
      setErrors({ role: 'Please select a role' })
      setLoading(false)
      return
    }

    try {
      // Create the signup
      await signUp.create({
        firstName: firstName,
        lastName: lastName,
        emailAddress,
        password,
      })

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      setLoading(false)
      
    } catch (err) {
      console.error('Signup error:', err)
      setLoading(false)
      
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = {}
        err.errors.forEach(error => {
          if (error.meta?.paramName === 'email_address') {
            errorMessages.email = error.longMessage || 'Email error'
          } else if (error.meta?.paramName === 'password') {
            errorMessages.password = error.longMessage || 'Password error'
          } else {
            errorMessages.general = error.longMessage || error.message || 'An error occurred'
          }
        })
        setErrors(errorMessages)
      } else {
        setErrors({ general: err.message || 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  // Handle verification
  const onPressVerify = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      
      if (completeSignUp.status === 'complete') {
        // Update user metadata after successful verification
        try {
          await completeSignUp.update({
            publicMetadata: {
              role: role
            }
          })
        } catch (metaError) {
          console.warn('Failed to update metadata:', metaError)
        }
        
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/home')
      } else {
        setErrors({ code: 'Verification failed. Please try again.' })
      }
      setLoading(false)
    } catch (err) {
      console.error('Verification error:', err)
      setErrors({ code: err.errors?.[0]?.longMessage || 'Invalid verification code' })
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setErrors({ image: 'Image is too large. Please upload an image smaller than 1 MB' })
        return
      }
      setProfileImage(file)
      setErrors({ ...errors, image: '' })
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 w-400">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        {!pendingVerification ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">QUICKCOURT</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">SIGN UP</h3>
            </div>

            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <Label className="text-sm font-medium text-gray-700 mb-3">Profile Picture</Label>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                    {profileImage ? (
                      <img 
                        src={URL.createObjectURL(profileImage)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Sign up as</Label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-700"
                    required
                  >
                    <option value="">Player / Facility Owner</option>
                    <option value="USER">Player</option>
                    <option value="FACILITY_OWNER">Facility Owner</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">First Name</Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Email</Label>
                <Input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                    Log In
                  </a>
                </span>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Verification Form */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">QUICKCOURT</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">Check your email</h3>
              <p className="text-sm text-gray-600 mt-2">
                We sent a verification code to {emailAddress}
              </p>
            </div>

            <form onSubmit={onPressVerify} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Verification Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="Enter verification code"
                  required
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {loading ? 'Verifying...' : 'Verify and Continue'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default SignUpPage