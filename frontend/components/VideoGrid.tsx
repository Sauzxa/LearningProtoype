'use client';

import { useEffect, useRef, useState } from 'react';
import { Room, RemoteParticipant, Participant, Track } from 'livekit-client';

interface VideoGridProps {
  room: Room;
  participants: RemoteParticipant[];
}

interface ParticipantViewProps {
  participant: Participant;
  isLocal: boolean;
}

export default function VideoGrid({ room, participants }: VideoGridProps) {
  return (
    <div className="video-grid">
      {/* Local participant - Requirements 11.2, 11.3 */}
      <ParticipantView
        participant={room.localParticipant}
        isLocal={true}
      />
      
      {/* Remote participants - Requirements 11.2, 11.3 */}
      {participants.map((participant) => (
        <ParticipantView
          key={participant.sid}
          participant={participant}
          isLocal={false}
        />
      ))}
    </div>
  );
}

function ParticipantView({ participant, isLocal }: ParticipantViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [, setUpdateTrigger] = useState(0);

  // Attach video tracks (camera and screen share) - Requirements 11.1, 11.4
  useEffect(() => {
    const attachVideoTracks = () => {
      if (!videoRef.current) return;

      // Detach any existing tracks first
      const existingTracks = videoRef.current.srcObject as MediaStream | null;
      if (existingTracks) {
        existingTracks.getTracks().forEach(track => {
          videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).removeTrack(track);
        });
      }

      // Find and attach video tracks (camera or screen share)
      participant.trackPublications.forEach((publication) => {
        if (publication.kind === 'video' && publication.track) {
          const track = publication.track as Track;
          console.log('Attaching video track:', publication.source, publication.kind);
          if ('attach' in track) {
            track.attach(videoRef.current!);
          }
        }
      });
    };

    const handleTrackUpdate = () => {
      console.log('Track update event fired');
      attachVideoTracks();
      setUpdateTrigger(prev => prev + 1);
    };

    attachVideoTracks();

    // Listen for track events - use different events for local vs remote
    if (isLocal) {
      participant.on('localTrackPublished', handleTrackUpdate);
      participant.on('localTrackUnpublished', handleTrackUpdate);
    } else {
      participant.on('trackSubscribed', handleTrackUpdate);
      participant.on('trackUnsubscribed', handleTrackUpdate);
    }

    return () => {
      if (isLocal) {
        participant.off('localTrackPublished', handleTrackUpdate);
        participant.off('localTrackUnpublished', handleTrackUpdate);
      } else {
        participant.off('trackSubscribed', handleTrackUpdate);
        participant.off('trackUnsubscribed', handleTrackUpdate);
      }
      
      // Detach all video tracks
      if (videoRef.current) {
        participant.trackPublications.forEach((publication) => {
          if (publication.kind === 'video' && publication.track) {
            const track = publication.track as Track;
            if ('detach' in track) {
              track.detach(videoRef.current!);
            }
          }
        });
      }
    };
  }, [participant, isLocal]);

  // Attach audio track (microphone) - Requirements 11.1, 11.5
  useEffect(() => {
    if (isLocal) return; // Don't play local audio

    const attachAudioTrack = () => {
      if (!audioRef.current) return;

      // Find audio track from publications
      participant.trackPublications.forEach((publication) => {
        if (publication.kind === 'audio' && publication.track) {
          const track = publication.track as Track;
          if ('attach' in track) {
            track.attach(audioRef.current!);
          }
        }
      });
    };

    attachAudioTrack();

    // Listen for track subscribed events
    participant.on('trackSubscribed', attachAudioTrack);
    participant.on('trackPublished', attachAudioTrack);

    return () => {
      participant.off('trackSubscribed', attachAudioTrack);
      participant.off('trackPublished', attachAudioTrack);
      
      // Detach all audio tracks
      if (audioRef.current) {
        participant.trackPublications.forEach((publication) => {
          if (publication.kind === 'audio' && publication.track) {
            const track = publication.track as Track;
            if ('detach' in track) {
              track.detach(audioRef.current!);
            }
          }
        });
      }
    };
  }, [participant, isLocal]);

  return (
    <div className="participant-view">
      <video ref={videoRef} autoPlay playsInline muted={isLocal} />
      <audio ref={audioRef} autoPlay />
      <div className="participant-name">
        {participant.identity} {isLocal && '(You)'}
      </div>
    </div>
  );
}
