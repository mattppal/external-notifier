import { NextResponse } from 'next/server'

const clientId = process.env.SLACK_CLIENT_ID
const redirectUri = `${process.env.BASE_URL}/api/auth/callback`

export async function GET() {
  const scope = 'channels:read,chat:write'
  const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`
  
  return NextResponse.redirect(slackAuthUrl)
}