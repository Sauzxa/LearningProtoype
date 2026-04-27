interface MediaControlsProps {
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenShareEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreenShare: () => void;
  canPublish: boolean;
}

export default function MediaControls({
  isCameraEnabled,
  isMicrophoneEnabled,
  isScreenShareEnabled,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreenShare,
  canPublish,
}: MediaControlsProps) {
  if (!canPublish) {
    return <div className="media-controls">Viewer mode - No publishing controls</div>;
  }

  return (
    <div className="media-controls">
      <button onClick={onToggleMicrophone}>
        {isMicrophoneEnabled ? 'Disable Microphone' : 'Enable Microphone'}
      </button>
      <button onClick={onToggleCamera}>
        {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
      </button>
      <button onClick={onToggleScreenShare}>
        {isScreenShareEnabled ? 'Stop Screen Share' : 'Share Screen'}
      </button>
    </div>
  );
}
