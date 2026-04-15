import React, { useState, useCallback, useRef } from "react";
import "./JarvisDashboard.css";

// Feature components
import GestureCamera from "../components/GestureCamera";
import ObjectManipulation from "../../object/components/ObjectManipulation";
import FloatingNav from "../../../shared/common/FloatingNav";
import SiriMic from "../../voice/components/SiriMic";
import ScreenShare from "../components/ScreenShare";

const JarvisDashboard = ({
  isActive,
  connectionStatus,
  sendMessage,
  lastMessage,
  readyState,
}) => {
  const [lastGesture, setLastGesture] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [handTrackingData, setHandTrackingData] = useState(null);
  const [objectCount, setObjectCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // Text to speech
  const speakText = useCallback((text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.9;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const jarvisVoice = voices.find(
        (v) =>
          v.name.includes("Male") ||
          v.name.includes("British") ||
          v.name.includes("Daniel") ||
          v.name.includes("Google UK English Male"),
      );
      if (jarvisVoice) utterance.voice = jarvisVoice;

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle incoming messages
  const handleServerMessage = useCallback(
    (data) => {
      switch (data.type) {
        case "jarvis_response":
          speakText(data.text);
          break;
        case "gesture_recognized":
          setLastGesture({
            name: data.gesture,
            command: data.command,
            description: data.description,
            timestamp: Date.now(),
          });
          break;
        default:
          break;
      }
    },
    [speakText],
  );

  // Process incoming WebSocket messages
  React.useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        handleServerMessage(data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  }, [lastMessage, handleServerMessage]);

  const handleGestureDetected = useCallback(
    (gesture) => {
      if (readyState === 1) {
        sendMessage(
          JSON.stringify({
            type: "gesture",
            gesture: gesture.name,
            confidence: gesture.confidence,
          }),
        );
      }
    },
    [sendMessage, readyState],
  );

  const handleHandTracking = useCallback((data) => {
    setHandTrackingData(data);
  }, []);

  const handleVoiceCommand = useCallback(
    (text) => {
      if (readyState === 1 && text.trim()) {
        sendMessage(
          JSON.stringify({
            type: "voice",
            text: text.trim(),
          }),
        );
      }
    },
    [sendMessage, readyState],
  );

  const handleScreenShare = useCallback((data) => {
    if (data.type === "start") {
      console.log("Screen sharing started");
      // Could send to server for AI analysis
    } else if (data.type === "stop") {
      console.log("Screen sharing stopped");
    }
  }, []);

  const handleObjectAction = useCallback((action) => {
    // Update object count based on action
    if (action.type === "create") {
      setObjectCount((prev) => prev + 1);
    } else if (action.type === "delete") {
      setObjectCount((prev) => Math.max(0, prev - 1));
    } else if (action.type === "delete_all") {
      setObjectCount(0);
    }
  }, []);

  return (
    <div className="fullscreen-dashboard">
      {/* Fullscreen Camera Section */}
      <div className="camera-fullscreen">
        <GestureCamera
          onGestureDetected={handleGestureDetected}
          onHandTracking={handleHandTracking}
          lastGesture={lastGesture}
          selectedAction={selectedAction}
          mode="dual"
        />

        <ObjectManipulation
          handTrackingData={handTrackingData}
          selectedAction={selectedAction}
          onObjectAction={handleObjectAction}
        />
      </div>

      {/* Expandable Floating Navigation */}
      <FloatingNav
        selectedAction={selectedAction}
        onActionSelect={setSelectedAction}
        objectCount={objectCount}
        onScreenShare={() => {}}
        onShowHelp={() => setShowHelp(!showHelp)}
      />

      {/* Siri Mic Button */}
      <SiriMic onVoiceCommand={handleVoiceCommand} isListening={isActive} />

      {/* Screen Share in corner */}
      <div className="screen-share-corner">
        <ScreenShare onScreenCapture={handleScreenShare} />
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-content">
            <h3>Gesture Controls</h3>
            <div className="gesture-list">
              <div className="gesture-item">
                <span className="gesture-emoji">🙏</span>
                <span className="gesture-desc">
                  Hands Close = Create Object
                </span>
              </div>
              <div className="gesture-item">
                <span className="gesture-emoji">🤏🤏</span>
                <span className="gesture-desc">Both Pinch = Grab/Move</span>
              </div>
              <div className="gesture-item">
                <span className="gesture-emoji">🤏</span>
                <span className="gesture-desc">Right Pinch = Select</span>
              </div>
              <div className="gesture-item">
                <span className="gesture-emoji">👈</span>
                <span className="gesture-desc">Left Pinch = Edit</span>
              </div>
              <div className="gesture-item">
                <span className="gesture-emoji">👐</span>
                <span className="gesture-desc">Hands Apart = Delete All</span>
              </div>
            </div>
            <p className="help-hint">Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JarvisDashboard;
