import { NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { channels, message } = await request.json()
  const cookieStore = cookies()
  const accessToken = cookieStore.get('slackAccessToken')?.value

  if (!accessToken) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const client = new WebClient(accessToken)

  try {
    const results = await Promise.all(channels.map(channelId => 
      client.chat.postMessage({
        channel: channelId,
        text: message,
      })
    ))

    console.log(`Messages sent to ${results.length} channels`)
    return NextResponse.json({ success: true, message: 'Notification sent successfully!' })
  } catch (error) {
    console.error('Error sending Slack notification:', error)
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 })
  }
}