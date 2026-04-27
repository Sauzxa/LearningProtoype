'use client';

import { useState, useEffect, useRef } from 'react';
import { Room, RoomEvent } from 'livekit-client';

interface ChatPanelProps {
  room: Room;
  currentUserIdentity: string;
  onClose?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: number;
}

export default function ChatPanel({ room, currentUserIdentity, onClose, onUnreadCountChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message receiving functionality - Task 17.3
  useEffect(() => {
    // Handler for receiving data messages from other participants
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: any,
      kind?: any
    ) => {
      try {
        // Decode received data using TextDecoder
        const decoder = new TextDecoder();
        const text = decoder.decode(payload);
        
        // Parse JSON to extract message object
        const receivedMessage: ChatMessage = JSON.parse(text);
        
        // Add received message to messages state
        setMessages((prev) => {
          // Combine previous messages with new message
          const updatedMessages = [...prev, receivedMessage];
          
          // Sort messages by timestamp to maintain chronological order
          return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
        });
      } catch (error) {
        console.error('Failed to process received message:', error);
      }
    };

    // Listen to RoomEvent.DataReceived
    room.on(RoomEvent.DataReceived, handleDataReceived);

    // Clean up event listener on component unmount
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate message is not empty before sending
    if (!inputText.trim()) {
      return;
    }

    try {
      // Create message object with sender identity, text, and timestamp
      const message: ChatMessage = {
        sender: currentUserIdentity,
        text: inputText.trim(),
        timestamp: Date.now(),
      };

      // Encode message as JSON using TextEncoder
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));

      // Use room.localParticipant.publishData() to send message
      // Set reliable: true option for guaranteed delivery
      await room.localParticipant.publishData(data, { reliable: true });

      // Add sent message to local messages state
      setMessages((prev) => [...prev, message]);

      // Clear input field after sending
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle Enter key to send message (Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Chat</h3>
        {onClose && (
          <button 
            onClick={onClose} 
            className="chat-close-button"
            aria-label="Close chat"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet</div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`chat-message-wrapper ${message.sender === currentUserIdentity ? 'own-message' : 'received-message'}`}
            >
              <div className="chat-message">
                <div className="message-sender">{message.sender}</div>
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          className="chat-input"
          rows={1}
        />
        <button 
          type="submit" 
          className="chat-send-button"
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
        </button>
      </form>
    </div>
  );
}
