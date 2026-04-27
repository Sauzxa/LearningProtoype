'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [roomName, setRoomName] = useState('')
  const router = useRouter()

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Trim whitespace from room name (Requirement 13.4)
    const trimmedRoomName = roomName.trim()
    
    // Prevent navigation when room name is empty (Requirement 13.5)
    if (!trimmedRoomName) {
      return
    }
    
    // Navigate to /{roomName} (Requirement 13.3)
    router.push(`/${trimmedRoomName}`)
  }

  return (
    <div className="home-container">
      <h1>LiveKit Streaming Platform</h1>
      <p>Enter a room name to join or create a room</p>
      
      {/* Form with room name input field (Requirement 13.2) */}
      <form onSubmit={handleJoinRoom} className="home-form">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
        />
        <button type="submit">
          Join Room
        </button>
      </form>
    </div>
  )
}
