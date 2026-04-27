'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Room } from 'livekit-client'
import RoleSelector from '@/components/RoleSelector'
import RoomInterface from '@/components/RoomInterface'

export default function RoomPage() {
  // Extract roomName from URL parameters (Requirement 1.1, 1.2)
  const params = useParams()
  const roomName = params.roomName as string

  // State management for room connection (Requirement 1.3)
  const [room, setRoom] = useState<Room | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Handle role selection and room joining (Requirements 1.2, 2.3, 4.4, 4.5, 9.2)
  const handleJoin = async (role: 'publisher' | 'viewer', participantName?: string) => {
    setIsConnecting(true)
    
    try {
      // Construct token request URL with query parameters
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const params = new URLSearchParams({
        roomName: roomName,
        role: role,
      })
      
      // Add participantName if provided
      if (participantName) {
        params.append('participantName', participantName)
      }
      
      const tokenUrl = `${backendUrl}/livekit/token?${params.toString()}`
      
      // Fetch token from backend endpoint
      const response = await fetch(tokenUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`)
      }
      
      // Parse response to extract token and url
      const { token, url } = await response.json()
      
      // Create new Room instance from livekit-client
      const newRoom = new Room()
      
      // Connect to LiveKit server using token
      await newRoom.connect(url, token)
      
      // Update room state on successful connection
      setRoom(newRoom)
    } catch (error) {
      console.error('Failed to join room:', error)
      setIsConnecting(false)
    }
  }

  // Conditionally render RoleSelector or RoomInterface based on room state
  if (!room) {
    return <RoleSelector onJoin={handleJoin} />
  }

  return <RoomInterface room={room} />
}
