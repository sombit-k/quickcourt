"use client";
import { useSignUp } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

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
  const router = useRouter()

  // Handle the submission of the sign-up form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isLoaded) return

    // Reset errors
    setErrors({})

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    // Simplified password validation - just require 8+ characters
    if (password.length < 8) {
      setErrors({ 
        password: 'Password must be at least 8 characters long'
      })
      return
    }

    try {
      // Create the signup without triggering CAPTCHA
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password,
        unsafeMetadata: {
          role: role
        }
      })

      // If signup is complete (no email verification required), sign in immediately
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/')
        return
      }

      // Otherwise, prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
      
    } catch (err) {
      console.error('Signup error:', err)
      
      // Handle specific error types
      if (err.errors) {
        const errorMessages = {}
        err.errors.forEach(error => {
          switch (error.code) {
            case 'form_identifier_exists':
              errorMessages.email = 'This email is already registered'
              break
            case 'form_password_pwned':
              errorMessages.password = 'This password has been compromised. Please choose a different one.'
              break
            case 'form_password_length_too_short':
              errorMessages.password = 'Password is too short'
              break
            default:
              errorMessages.general = error.longMessage || error.message || 'An error occurred'
          }
        })
        setErrors(errorMessages)
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' })
      }
    }
  }

  // Handle the submission of the verification form
  const onPressVerify = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      if (completeSignUp.status !== 'complete') {
        console.log(JSON.stringify(completeSignUp, null, 2))
      }
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      setErrors({ code: err.errors?.[0]?.longMessage || 'Invalid verification code' })
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

  return (
    <div className="min-h-screen flex items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            QUICKCOURT
          </h2>
          <h3 className="mt-2 text-center text-xl font-bold text-gray-900">
            SIGN UP
          </h3>
        </div>

        {!pendingVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="text-red-600 text-sm text-center">{errors.general}</div>
            )}

            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-2">
              <Label htmlFor="profile-picture">Profile Picture</Label>
              <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img 
                    src={URL.createObjectURL(profileImage)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full"></div>
                )}
              </div>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {errors.image && (
                <p className="text-red-600 text-sm">{errors.image}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role">Sign up as</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Role</option>
                <option value="player">Player</option>
                <option value="facility">Facility Owner</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Up
              </Button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                  Log In
                </a>
              </span>
            </div>
          </form>
        ) : (<>
          <form onSubmit={onPressVerify} className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 text-center">
                Check your email
              </h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                We sent a verification code to {emailAddress}
              </p>
            </div>
            
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
                className="mt-1"
              />
              {errors.code && (
                <p className="text-red-600 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Verify and Continue
            </Button>
          </form>
          <form onSubmit={onPressVerify} className="mt-8 space-y-6">
              <Button>Resend Code</Button>
          </form>
        </>
        )}
      </div>
    </div>
  )
}

export default SignUpPage