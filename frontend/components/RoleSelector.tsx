'use client'

import { useState } from 'react'

export interface RoleSelectorProps {
  onJoin: (role: 'publisher' | 'viewer', participantName?: string) => void
}

export default function RoleSelector({ onJoin }: RoleSelectorProps) {
  const [participantName, setParticipantName] = useState('')
  const [selectedRole, setSelectedRole] = useState<'publisher' | 'viewer' | null>(null)

  const handleJoin = () => {
    if (selectedRole) {
      // Call onJoin callback with role and optional name (Requirement 4.3)
      onJoin(selectedRole, participantName.trim() || undefined)
    }
  }

  return (
    <div className="role-selector-container">
      <h1>Join Room</h1>
      <p>Select your role to continue</p>

      {/* Optional participant name input field (Requirement 4.3) */}
      <div className="role-selector-form">
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="Enter your name (optional)"
        />

        {/* Role selection buttons (Requirement 4.2) */}
        <div className="role-buttons">
          <button
            onClick={() => setSelectedRole('publisher')}
            className={`role-button ${selectedRole === 'publisher' ? 'selected' : ''}`}
          >
            Publisher
          </button>
          <button
            onClick={() => setSelectedRole('viewer')}
            className={`role-button ${selectedRole === 'viewer' ? 'selected' : ''}`}
          >
            Viewer
          </button>
        </div>

        {/* Join button */}
        <button
          onClick={handleJoin}
          disabled={!selectedRole}
          className="join-button"
        >
          Join Room
        </button>
      </div>
    </div>
  )
}
