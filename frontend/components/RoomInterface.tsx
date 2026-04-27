'use client';

import { useEffect, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import VideoGrid from './VideoGrid';
import MediaControls from './MediaControls';
import ChatPanel from './ChatPanel';

interface RoomInterfaceProps {
  room: Room;
}

export default function RoomInterface({ room }: RoomInterfaceProps) {
  // Initialize participants from room.remoteParticipants - Requirement 7.2
  const [participants, setParticipants] = useState(
    Array.from(room.remoteParticipants.values())
  );
  
  // Media state for camera, microphone, and screen share - Requirements 7.2, 7.3
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  // Chat panel visibility state - Task 17.4
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Unread message counter - Task 17.6
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time participant event handlers - Requirements 7.2, 7.3, 7.4, 7.5
  useEffect(() => {
    // Handler for when a new participant connects to the room
    const handleParticipantConnected = () => {
      setParticipants(Array.from(room.remoteParticipants.values()));
    };

    // Handler for when a participant disconnects from the room
    const handleParticipantDisconnected = () => {
      setParticipants(Array.from(room.remoteParticipants.values()));
    };

    // Handler for when a new track is subscribed (e.g., video/audio stream)
    const handleTrackSubscribed = () => {
      setParticipants(Array.from(room.remoteParticipants.values()));
    };

    // Register event listeners
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);

    // Cleanup: Remove event listeners on component unmount
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    };
  }, [room]);

  // Track unread messages when chat is closed - Task 17.6
  useEffect(() => {
    const handleDataReceived = () => {
      if (!isChatOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, isChatOpen]);

  // Reset unread count when chat is opened
  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
    }
  };

  // Camera toggle functionality - Requirements 5.2, 5.3, 5.4
  const toggleCamera = async () => {
    try {
      if (isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(false);
        setIsCameraEnabled(false);
      } else {
        await room.localParticipant.setCameraEnabled(true);
        setIsCameraEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle camera:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Camera permission denied. Please allow camera access in your browser settings.');
      }
      setIsCameraEnabled(false);
    }
  };

  // Microphone toggle functionality
  const toggleMicrophone = async () => {
    try {
      if (isMicrophoneEnabled) {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMicrophoneEnabled(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMicrophoneEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please allow microphone access in your browser settings.');
      }
      setIsMicrophoneEnabled(false);
    }
  };

  // Screen share toggle functionality - Requirements 6.2, 6.3, 6.4
  const toggleScreenShare = async () => {
    try {
      if (isScreenShareEnabled) {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenShareEnabled(false);
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenShareEnabled(true);
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        alert('Screen share permission denied. Please allow screen sharing.');
      }
      setIsScreenShareEnabled(false);
    }
  };

  return (
    <div className="room-interface">
      {/* Participant counter in top-left */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}>
        👥 {participants.length + 1} {participants.length + 1 === 1 ? 'participant' : 'participants'}
      </div>

      {/* Chat toggle button in top-right - Task 17.4 */}
      <button
        onClick={handleChatToggle}
        className="chat-toggle-button"
      >
        💬 Chat
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </button>
      
      {/* Render VideoGrid with room and participants - Requirement 11.2 */}
      <VideoGrid room={room} participants={participants} />
      
      {/* Render MediaControls with state and toggle handlers - Requirements 5.1, 6.1 */}
      <MediaControls
        isCameraEnabled={isCameraEnabled}
        isMicrophoneEnabled={isMicrophoneEnabled}
        isScreenShareEnabled={isScreenShareEnabled}
        onToggleCamera={toggleCamera}
        onToggleMicrophone={toggleMicrophone}
        onToggleScreenShare={toggleScreenShare}
        canPublish={room.localParticipant.permissions?.canPublish || false}
      />

      {/* Render ChatPanel conditionally as overlay on right side - Task 17.4 */}
      {isChatOpen && (
        <ChatPanel 
          room={room} 
          currentUserIdentity={room.localParticipant.identity}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
