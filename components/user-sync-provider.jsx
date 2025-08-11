"use client"
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { syncUser } from '@/actions/user-sync'

export default function UserSyncProvider({ children }) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const handleUserSync = async () => {
      if (isLoaded && user) {
        try {
          // Sync user data to database when they first authenticate
          const syncData = {
            clerkId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
            firstName: user.firstName || 'User',
            lastName: user.lastName || '',
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatar: user.imageUrl,
            role: 'USER'
          }

          await syncUser(syncData)
        } catch (error) {
          // Silently handle sync errors - user can manually sync later
          console.log('Background user sync failed:', error.message)
        }
      }
    }

    handleUserSync()
  }, [user, isLoaded])

  return <>{children}</>
}
