'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { syncUser } from '@/actions/user-sync'

export default function UserSync() {
  const { user, isLoaded } = useUser()
  console.log("UserSync component rendered", { user, isLoaded })
  
  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded && user) {
        try {
          // Extract serializable data from user object
          const userData = {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profileImage: user.imageUrl || null,
            role: user.unsafeMetadata?.role || null
          }
          
          await syncUser(userData)
        } catch (error) {
          console.error('Failed to sync user:', error)
        }
      }
    }

    handleUserSync()
  }, [user, isLoaded])

  return null
}
