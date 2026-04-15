import React, { useState, useCallback, useRef } from 'react';
import './JarvisDashboard.css';

// Feature components
import GestureCamera from '../components/GestureCamera';
import ObjectManipulation from '../../object/components/ObjectManipulation';
import FloatingActions from '../../../shared/common/FloatingActions';
import Instructions from '../../../shared/common/Instructions';
import JarvisInterface from '../../chat/components/JarvisInterface';
import VoiceControl from '../../voice/components/VoiceControl';

const JarvisDashboard = ({ isActive, connectionStatus, sendMessage, lastMessage, readyState }) => {
  const [lastGesture, setLastGesture] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showCamera, setShowCamera] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);
  const [handTrackingData, setHandTrackingData] = useState(null);
  const [objectCount, setObjectCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Handle incoming messages
  const handleServerMessage = (data) => {
    switch (data.type) {
      case 'connection':
        addMessage({ type: 'system', text: data.message });
        break;
      case 'jarvis_response':
        addMessage({ type: 'jarvis', text: data.text });
        speakText(data.text);
        break;
      case 'gesture_recognized':
        setLastGesture({
          name: data.gesture,
          command: data.command,
          description: data.description,
          timestamp: Date.now()
        });
        addMessage({ type: 'gesture', text: `Gesture detected: ${data.description}` });
        break;
      case 'voice_recognized':
        addMessage({ type: 'user', text: data.text });
        break;
      case 'error':
        addMessage({ type: 'error', text: data.message });
        break;
      default:
        break;
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev.slice(-50), { ...message, id: Date.now() }]);
  };

  const handleGestureDetected = useCallback((gesture) => {
    if (readyState === 1) {
      sendMessage(JSON.stringify({
        type: 'gesture',
        gesture: gesture.name,
        confidence: gesture.confidence
      }));
    }
  }, [sendMessage, readyState]);

  const handleHandTracking = useCallback((data) => {
    setHandTrackingData(data);
  }, []);

  const handleVoiceCommand = useCallback((text) => {
    if (readyState === 1 && text.trim()) {
      sendMessage(JSON.stringify({
        type: 'voice',
        text: text.trim()
      }));
    }
  }, [sendMessage, readyState]);

  const handleSendMessage = useCallback((text) => {
    if (readyState === 1 && text.trim()) {
      addMessage({ type: 'user', text });
      sendMessage(JSON.stringify({
        type: 'chat',
        message: text.trim()
      }));
    }
  }, [sendMessage, readyState]);

  const handleObjectAction = useCallback((action) => {
    if (action.type === 'create') {
      addMessage({ type: 'system', text: `Created object #${action.object.id.toString().slice(-4)}` });
    } else if (action.type === 'delete') {
      addMessage({ type: 'system', text: `Deleted object` });
    } else if (action.type === 'delete_all') {
      addMessage({ type: 'system', text: 'Deleted all objects' });
    } else if (action.type === 'grab') {
      addMessage({ type: 'system', text: 'Grabbed object' });
    } else if (action.type === 'throw') {
      addMessage({ type: 'system', text: 'Object thrown!' });
    } else if (action.type === 'select') {
      addMessage({ type: 'system', text: `Selected object #${action.object.id.toString().slice(-4)}` });
    }
  }, []);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      const jarvisVoice = voices.find(v => 
        v.name.includes('Male') || 
        v.name.includes('British') ||
        v.name.includes('Daniel') ||
        v.name.includes('Google UK English Male')
      );
      if (jarvisVoice) utterance.voice = jarvisVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
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
            if (action.type === 'create') setObjectCount(prev => prev + 1);
            if (action.type === 'delete') setObjectCount(prev => prev - 1);
            if (action.type === 'delete_all') setObjectCount(0);
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

      <VoiceControl 
        onVoiceCommand={handleVoiceCommand}
        isListening={isActive}
      />

      <Instructions />
    </>
  );
};

export default JarvisDashboard;
