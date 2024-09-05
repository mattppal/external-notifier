'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Channel {
  id: string;
  name: string;
}

export default function Home() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    if (isAuthenticated) {
      fetchChannels()
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {
    const response = await fetch('/api/auth/status')
    const data = await response.json()
    setIsAuthenticated(data.isAuthenticated)
  }

  const handleLogin = () => {
    window.location.href = '/api/auth/login'
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/get-channels')
      const data = await response.json()
      if (data.success) {
        setChannels(data.channels)
      } else {
        throw new Error(data.error || 'Failed to fetch channels')
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
      setNotification({ type: 'error', message: 'Failed to fetch channels. Please refresh the page.' })
    }
  }

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev =>
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const handleSelectAllChannels = () => {
    if (selectedChannels.length === channels.length) {
      setSelectedChannels([])
    } else {
      setSelectedChannels(channels.map(channel => channel.id))
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: selectedChannels, message }),
      })
      const data = await response.json()
      if (data.success) {
        setNotification({ type: 'success', message: data.message || 'Notification sent successfully!' })
      } else {
        throw new Error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error:', error)
      setNotification({ type: 'error', message: 'Failed to send notification. Please try again.' })
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Slack Notification Sender</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Login with Slack
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Send Slack Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Select Channels:</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllChannels}
                  >
                    {selectedChannels.length === channels.length ? 'Clear All' : 'Select All'}
                  </Button>
                </div>
                {channels.map(channel => (
                  <div key={channel.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel.id}
                      checked={selectedChannels.includes(channel.id)}
                      onCheckedChange={() => handleChannelToggle(channel.id)}
                    />
                    <label htmlFor={channel.id}>{channel.name}</label>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Message:</h3>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Enter your message (Markdown supported)"
                  rows={6}
                  className="min-h-[150px]"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Send Notification
              </Button>
              {notification && (
                <Alert variant={notification.type === 'success' ? 'default' : 'destructive'}>
                  <AlertTitle>{notification.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
