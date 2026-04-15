import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiVolume2 } from 'react-icons/fi';
import './VoiceControl.css';

const VoiceControl = ({ onVoiceCommand, isListening: isSystemActive }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const volumeIntervalRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        
        // Simulate volume visualization
        volumeIntervalRef.current = setInterval(() => {
          setVolume(Math.random() * 100);
        }, 100);
      };

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        if (final) {
          setTranscript(prev => prev + final);
          onVoiceCommand(final);
          setTimeout(() => {
            setTranscript('');
            setInterimTranscript('');
          }, 3000);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current);
        }
        
        // Restart if it was an audio capture error
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          setTimeout(() => startListening(), 1000);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setVolume(0);
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current);
        }
        
        // Auto-restart if it wasn't manually stopped
        if (isSystemActive) {
          setTimeout(() => startListening(), 500);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
    };
  }, [onVoiceCommand, isSystemActive]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isSystemActive) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  }, [isListening, isSystemActive]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setVolume(0);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Auto-start when system becomes active
  useEffect(() => {
    if (isSystemActive && !isListening) {
      startListening();
    }
  }, [isSystemActive, startListening, isListening]);

  const getVolumeBars = () => {
    return Array.from({ length: 20 }, (_, i) => (
      <div 
        key={i} 
        className="volume-bar"
        style={{ 
          height: isListening ? `${Math.min(100, volume * (0.5 + Math.random()))}%` : '10%',
          opacity: isListening ? 1 : 0.3
        }}
      />
    ));
  };

  return (
    <div className="voice-control">
      <div className="voice-panel">
        <button 
          className={`voice-button ${isListening ? 'listening' : ''} ${!isSystemActive ? 'disabled' : ''}`}
          onClick={toggleListening}
          disabled={!isSystemActive}
        >
          {isListening ? (
            <div className="mic-pulse">
              <FiMic size={24} />
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
            </div>
          ) : (
            <FiMicOff size={24} />
          )}
        </button>

        <div className="voice-visualizer">
          {getVolumeBars()}
        </div>

        <div className={`voice-status ${isListening ? 'active' : ''}`}>
          {isListening ? (
            <>
              <span className="listening-text">Listening...</span>
              <span className="wave-animation">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </span>
            </>
          ) : (
            <span className="standby-text">
              {isSystemActive ? 'Voice Ready' : 'System Offline'}
            </span>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="transcript-display">
          <FiVolume2 className="transcript-icon" />
          <div className="transcript-text">
            {transcript && <span className="final-text">{transcript}</span>}
            {interimTranscript && (
              <span className="interim-text"> {interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Wake Word Hint */}
      <div className="voice-hint">
        <span>Speak clearly or use gestures</span>
      </div>
    </div>
  );
};

export default VoiceControl;
