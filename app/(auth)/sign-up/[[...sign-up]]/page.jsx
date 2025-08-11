"use client";

import { useSignUp, useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { user, isLoaded: userLoaded } = useUser()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Redirect if user is already authenticated
  useEffect(() => {
    if (userLoaded && user) {
      router.push('/home')
    }
  }, [userLoaded, user, router])

  // Show loading while checking authentication
  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't render the sign-up form
  if (user) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoaded) return

    setLoading(true)
    setError('')
    
    try {
      // Clear any existing sign-up attempts
      if (signUp) {
        await signUp.create({
          firstName,
          lastName,
          emailAddress,
          password,
        })

        // Immediately prepare verification in the same try block
        await signUp.prepareEmailAddressVerification({ 
          strategy: 'email_code',
        })
        setPendingVerification(true)
      }
    } catch (err) {
      console.error('Signup error:', err)
      
      // Handle specific error cases
      if (err.errors) {
        const errorMessage = err.errors[0]?.message || 'An error occurred during signup'
        setError(errorMessage)
        
        // If email already exists, suggest sign in
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exists')) {
          setError('This email is already registered. Please sign in instead.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      
      // Reset verification state on error
      setPendingVerification(false)
    }
    setLoading(false)
  }

  const onPressVerify = async (e) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setLoading(true)
    setError('')
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId })
        router.push('/home')
      } else {
        setError('Verification incomplete. Please try again.')
      }
    } catch (err) {
      console.error('Verification error:', err)
      const errorMessage = err.errors?.[0]?.message || 'Verification failed'
      setError(errorMessage)
      
      // If verification code is wrong, don't reset the form
      if (!errorMessage.toLowerCase().includes('code')) {
        setPendingVerification(false)
      }
    }
    setLoading(false)
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return
    
    setLoading(true)
    setError('')
    
    try {
      await signUp.prepareEmailAddressVerification({ 
        strategy: 'email_code',
      })
      setError('') // Clear any errors
      // Show success message or toast here if you have toast setup
    } catch (err) {
      console.error('Resend error:', err)
      setError('Failed to resend code. Please try again.')
    }
    setLoading(false)
  }

  const handleBackToSignUp = () => {
    setPendingVerification(false)
    setCode('')
    setError('')
  }

  if (pendingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
              Check Your Email
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              We've sent a verification code to {emailAddress}
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={onPressVerify} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                Resend verification code
              </button>
              <br />
              <button
                type="button"
                onClick={handleBackToSignUp}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Back to sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-6">
            Create Account
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="Email Address"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div id="clerk-captcha" className="mb-4" />
            <button 
              type="submit"
              disabled={loading || !isLoaded}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/sign-in" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}