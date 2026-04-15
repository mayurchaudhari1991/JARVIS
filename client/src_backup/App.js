import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import JarvisInterface from "./components/JarvisInterface";
import GestureCamera from "./components/GestureCamera";
import VoiceControl from "./components/VoiceControl";
import ObjectManipulation from "./components/ObjectManipulation";
import FloatingActions from "./components/FloatingActions";
import Instructions from "./components/Instructions";
import useWebSocket from "./hooks/useWebSocket";

function App() {
  const [isActive, setIsActive] = useState(false);
  const [lastGesture, setLastGesture] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [showCamera, setShowCamera] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [handTrackingData, setHandTrackingData] = useState(null);
  const [objectCount, setObjectCount] = useState(0);
  const messagesEndRef = useRef(null);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    "ws://localhost:5000",
  );

  // Handle WebSocket connection status
  useEffect(() => {
    const statusMap = {
      0: "connecting",
      1: "connected",
      2: "closing",
      3: "disconnected",
    };
    setConnectionStatus(statusMap[readyState] || "unknown");
  }, [readyState]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      handleServerMessage(data);
    }
  }, [lastMessage]);

  const handleServerMessage = (data) => {
    switch (data.type) {
      case "connection":
        addMessage({ type: "system", text: data.message });
        setIsActive(true);
        break;
      case "jarvis_response":
        addMessage({ type: "jarvis", text: data.text });
        speakText(data.text);
        break;
      case "gesture_recognized":
        setLastGesture({
          name: data.gesture,
          command: data.command,
          description: data.description,
          timestamp: Date.now(),
        });
        addMessage({
          type: "gesture",
          text: `Gesture detected: ${data.description}`,
        });
        break;
      case "voice_recognized":
        addMessage({ type: "user", text: data.text });
        break;
      case "error":
        addMessage({ type: "error", text: data.message });
        break;
      default:
        break;
    }
  };

  const addMessage = (message) => {
    setMessages((prev) => [...prev.slice(-50), { ...message, id: Date.now() }]);
  };

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

  const handleSendMessage = useCallback(
    (text) => {
      if (readyState === 1 && text.trim()) {
        addMessage({ type: "user", text });
        sendMessage(
          JSON.stringify({
            type: "chat",
            message: text.trim(),
          }),
        );
      }
    },
    [sendMessage, readyState],
  );

  const handleObjectAction = useCallback((action) => {
    if (action.type === "create") {
      addMessage({
        type: "system",
        text: `Created object #${action.object.id.toString().slice(-4)}`,
      });
    } else if (action.type === "delete") {
      addMessage({ type: "system", text: `Deleted object` });
    } else if (action.type === "delete_all") {
      addMessage({ type: "system", text: "Deleted all objects" });
    } else if (action.type === "grab") {
      addMessage({ type: "system", text: "Grabbed object" });
    } else if (action.type === "throw") {
      addMessage({ type: "system", text: "Object thrown!" });
    } else if (action.type === "select") {
      addMessage({
        type: "system",
        text: `Selected object #${action.object.id.toString().slice(-4)}`,
      });
    }
  }, []);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
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
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="app">
      <div className="app-background">
        <div className="grid-overlay"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-ring ring-1"></div>
            <div className="logo-ring ring-2"></div>
            <div className="logo-ring ring-3"></div>
            <span className="logo-text">J</span>
          </div>
          <div className="logo-title">
            <h1>J.A.R.V.I.S.</h1>
            <span>Dual-Hand Gesture System</span>
          </div>
        </div>

        <div className="header-controls">
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">{connectionStatus}</span>
          </div>
          <button
            className={`camera-toggle ${showCamera ? "active" : ""}`}
            onClick={() => setShowCamera(!showCamera)}
          >
            {showCamera ? "Hide Camera" : "Show Camera"}
          </button>
        </div>
      </header>

      <main className="app-main immersive">
        <div className="camera-section">
          {showCamera && (
            <GestureCamera
              onGestureDetected={handleGestureDetected}
              onHandTracking={handleHandTracking}
              lastGesture={lastGesture}
              selectedAction={selectedAction}
              mode="dual"
            />
          )}

          <ObjectManipulation
            handTrackingData={handTrackingData}
            selectedAction={selectedAction}
            onObjectAction={(action) => {
              handleObjectAction(action);
              if (action.type === "create") setObjectCount((prev) => prev + 1);
              if (action.type === "delete") setObjectCount((prev) => prev - 1);
              if (action.type === "delete_all") setObjectCount(0);
            }}
          />

          <FloatingActions
            selectedAction={selectedAction}
            onActionSelect={setSelectedAction}
            objectCount={objectCount}
            handTrackingData={handTrackingData}
          />
        </div>

        <JarvisInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
          isActive={isActive}
        />
      </main>

      <VoiceControl
        onVoiceCommand={handleVoiceCommand}
        isListening={isActive}
      />

      <Instructions />
    </div>
  );
}

export default App;
