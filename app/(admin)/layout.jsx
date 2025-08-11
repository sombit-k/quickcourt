'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // Redirect unauthenticated users to sign-in
        router.push('/sign-in')
        return
      }

      // Check if user has admin role
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          console.log('Admin layout user check:', data)
          if (data && data.role === 'ADMIN') {
            console.log('User is admin, setting authorized to true')
            setIsAuthorized(true)
          } else {
            console.log('User is not admin, redirecting to venue')
            // Redirect non-admin users to venue page
            router.push('/venue')
          }
        })
        .catch((error) => {
          console.error('Error checking user role:', error)
          router.push('/venue')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isLoaded, user, router])

  // Show loading while checking authentication
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Only render children for authorized admin users
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  )
}
