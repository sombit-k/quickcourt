import { NextResponse } from 'next/server'
import { syncUser } from '@/actions/user-sync'

export async function POST(req) {
  try {
    const userData = await req.json()
    
    // Validate required fields
    if (!userData.clerkId || !userData.email || !userData.firstName || !userData.lastName) {
      return NextResponse.json(
        { error: 'Missing required user data' },
        { status: 400 }
      )
    }

    // Sync user to database
    const user = await syncUser(userData)
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: 'Failed to sync user data' },
      { status: 500 }
    )
  }
}
