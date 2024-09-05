import { NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'

const clientId = process.env.SLACK_CLIENT_ID
const clientSecret = process.env.SLACK_CLIENT_SECRET
const redirectUri = `${process.env.BASE_URL}/api/auth/callback`

export async function GET(request: Request) {
  console.log('Environment variables:', {
    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET?.slice(0, 4) + '...', // Only log the first 4 characters for security
    BASE_URL: process.env.BASE_URL,
  })

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('Received code:', code)
  console.log('Redirect URI:', redirectUri)

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const client = new WebClient()
    console.log('Attempting OAuth access with:', { clientId, redirectUri })
    const oauthResponse = await client.oauth.v2.access({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    })

    console.log('OAuth response:', JSON.stringify(oauthResponse, null, 2))

    // Store the access token securely (e.g., in a database or encrypted cookie)
    // For this example, we'll use a secure HTTP-only cookie
    const redirectResponse = NextResponse.redirect(new URL('/', process.env.BASE_URL))
    redirectResponse.cookies.set('slackAccessToken', oauthResponse.access_token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return redirectResponse
  } catch (error) {
    console.error('Error during OAuth:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Failed to authenticate', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}