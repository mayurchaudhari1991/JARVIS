import React, { useState, useRef } from 'react';
import './ScreenShare.css';

const ScreenShare = ({ onScreenCapture }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsSharing(true);
      setHasPermission(true);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // Notify parent
      if (onScreenCapture) {
        onScreenCapture({
          type: 'start',
          stream: stream
        });
      }

    } catch (error) {
      console.error('Error starting screen share:', error);
      setHasPermission(false);
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);

    if (onScreenCapture) {
      onScreenCapture({
        type: 'stop'
      });
    }
  };

  const toggleScreenShare = () => {
    if (isSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  return (
    <div className="screen-share-container">
      {/* Hidden video element for screen capture */}
      <video
        ref={videoRef}
        className="screen-video"
        autoPlay
        playsInline
        muted
      />

      {/* Screen Share Button */}
      <button
        className={`screen-share-button ${isSharing ? 'active' : ''}`}
        onClick={toggleScreenShare}
        title={isSharing ? 'Stop sharing' : 'Share screen'}
      >
        <svg viewBox="0 0 24 24" className="share-icon">
          {isSharing ? (
            <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 8h6v2H9V8zm0 4h6v2H9v-2z"/>
          ) : (
            <>
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
              <path d="M12 8l-4 4h3v4h2v-4h3l-4-4z"/>
            </>
          )}
        </svg>
      </button>

      {/* Status indicator */}
      {isSharing && (
        <div className="screen-share-indicator">
          <span className="recording-dot"></span>
          <span>Sharing</span>
        </div>
      )}
    </div>
  );
};

export default ScreenShare;
