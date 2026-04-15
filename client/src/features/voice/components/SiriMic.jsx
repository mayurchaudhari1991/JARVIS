import React, { useState, useEffect, useRef, useCallback } from "react";
import "./SiriMic.css";

const SiriMic = ({ onVoiceCommand, isListening: externalListening }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false);

  useEffect(() => {
    if (externalListening !== undefined) {
      setIsListening(externalListening);
    }
  }, [externalListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    // Prevent starting if already listening or starting
    if (isListening || isStartingRef.current) {
      return;
    }

    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    isStartingRef.current = true;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setShowTranscript(true);
      isStartingRef.current = false;
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);

      if (event.results[current].isFinal) {
        onVoiceCommand(transcript);
        setTimeout(() => {
          setShowTranscript(false);
          setIsListening(false);
        }, 2000);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setShowTranscript(false);
      isStartingRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      isStartingRef.current = false;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);
      isStartingRef.current = false;
    }
  }, [isListening, onVoiceCommand]);

  return (
    <div className="siri-mic-container">
      {/* Transcript bubble */}
      {showTranscript && (
        <div className={`transcript-bubble ${isListening ? "active" : ""}`}>
          <p>{transcript || "Listening..."}</p>
        </div>
      )}

      {/* Siri Mic Button */}
      <button
        className={`siri-mic-button ${isListening ? "listening" : ""}`}
        onClick={startListening}
        title="Tap to speak"
      >
        <div className="mic-core">
          <svg viewBox="0 0 24 24" className="mic-icon">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>

        {/* Animated rings */}
        <div className="mic-ring ring-1"></div>
        <div className="mic-ring ring-2"></div>
        <div className="mic-ring ring-3"></div>
      </button>

      {/* Status text */}
      <span className="mic-status">
        {isListening ? "Listening..." : "Tap to speak"}
      </span>
    </div>
  );
};

export default SiriMic;
