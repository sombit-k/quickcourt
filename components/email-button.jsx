'use client'

import { Button } from '@/components/ui/button'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { triggerEmailFunction } from '@/actions/email-actions'

export function EmailButton() {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleSendEmail = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log('Sending email to:', user.emailAddresses[0]?.emailAddress)
      
      const result = await triggerEmailFunction({
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim()
      })
      
      alert(result.message || 'Email sent successfully!')
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <p>Logged in as: {user?.emailAddresses[0]?.emailAddress}</p>
      <Button 
        onClick={handleSendEmail} 
        disabled={isLoading || !user}
      >
        {isLoading ? 'Sending...' : 'Send Welcome Email'}
      </Button>
    </div>
  )
}
