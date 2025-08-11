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
          // Enhanced data extraction with multiple fallbacks
          const extractUserData = (userObj) => {
            // Try multiple sources for email
            const email = userObj.emailAddresses?.[0]?.emailAddress || 
                         userObj.primaryEmailAddress?.emailAddress ||
                         userObj.email

            // Try multiple sources for names
            const firstName = userObj.firstName || 
                             userObj.given_name || 
                             (userObj.username ? userObj.username.split(' ')[0] : null) ||
                             'User'
            
            const lastName = userObj.lastName || 
                            userObj.family_name || 
                            (userObj.username && userObj.username.includes(' ') ? 
                             userObj.username.split(' ').slice(1).join(' ') : '') ||
                            ''

            // Try multiple sources for avatar
            const avatar = userObj.imageUrl || 
                          userObj.profileImageUrl || 
                          userObj.profile_image_url ||
                          userObj.avatar_url

            // Try multiple sources for role
            const role = userObj.unsafeMetadata?.role || 
                        userObj.publicMetadata?.role || 
                        userObj.privateMetadata?.role ||
                        userObj.role

            return {
              clerkId: userObj.id,
              email,
              firstName,
              lastName,
              avatar,
              role
            }
          }

          const userData = extractUserData(user)
          
          // Validate essential data
          if (!userData.clerkId) {
            console.error('No clerk ID found for user:', user)
            return
          }

          if (!userData.email) {
            console.error('No email found for user:', user)
            return
          }
          
          console.log('Client userData:', userData)
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
