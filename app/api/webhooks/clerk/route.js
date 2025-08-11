import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { syncUser } from '@/actions/user-sync'

export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with ID ${id} and type ${eventType}`)

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        // Enhanced data extraction with multiple fallbacks
        const extractUserData = (data) => {
          // Try multiple sources for email
          const email = data.email_addresses?.[0]?.email_address || 
                       data.primary_email_address_id && 
                       data.email_addresses?.find(ea => ea.id === data.primary_email_address_id)?.email_address ||
                       data.email

          // Try multiple sources for names with better fallbacks
          const firstName = data.first_name || 
                           data.given_name || 
                           (data.username ? data.username.split(' ')[0] : null) ||
                           'User'
          
          const lastName = data.last_name || 
                          data.family_name || 
                          (data.username && data.username.includes(' ') ? 
                           data.username.split(' ').slice(1).join(' ') : '') ||
                          ''

          // Try multiple sources for avatar
          const avatar = data.profile_image_url || 
                        data.image_url || 
                        data.profile_pic_url ||
                        data.avatar_url

          // Try multiple sources for role
          const role = data.unsafe_metadata?.role || 
                      data.public_metadata?.role || 
                      data.private_metadata?.role ||
                      data.role

          return {
            clerkId: data.id,
            email,
            firstName,
            lastName,
            avatar,
            role
          }
        }

        const userData = extractUserData(evt.data)
        
        // Validate essential data
        if (!userData.clerkId) {
          console.error('No clerk ID found in webhook data:', evt.data)
          return new Response('Invalid user data - missing clerk ID', { status: 400 })
        }

        if (!userData.email) {
          console.error('No email found in webhook data:', evt.data)
          return new Response('Invalid user data - missing email', { status: 400 })
        }

        console.log('Webhook userData:', userData)
        await syncUser(userData)
        console.log(`User ${eventType} successfully synced to database`)
        break
      }
      case 'user.deleted': {
        // Handle user deletion if needed
        console.log(`User ${id} deleted from Clerk`)
        break
      }
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }

    return new Response('', { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    console.error('Webhook event data:', evt.data)
    return new Response(`Error handling webhook: ${error.message}`, { status: 500 })
  }
}
