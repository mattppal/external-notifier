import { NextResponse } from 'next/server'
import { WebClient } from '@slack/web-api'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('slackAccessToken')?.value

    if (!accessToken) {
        return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const client = new WebClient(accessToken)

    try {
        const result = await client.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true
        })

        const channels = result.channels?.filter(channel =>
            channel.is_channel
        ).map(channel => ({
            id: channel.id,
            name: channel.name
        }))

        return NextResponse.json({ success: true, channels })
    } catch (error) {
        console.error('Error fetching Slack channels:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch channels' }, { status: 500 })
    }
}