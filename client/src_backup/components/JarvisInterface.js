import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiMic, FiCpu, FiActivity, FiCommand } from 'react-icons/fi';
import './JarvisInterface.css';

const JarvisInterface = ({ messages, onSendMessage, messagesEndRef, isActive }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  const getMessageIcon = (type) => {
    switch (type) {
      case 'jarvis':
        return <FiCpu className="message-icon jarvis-icon" />;
      case 'user':
        return <FiCommand className="message-icon user-icon" />;
      case 'gesture':
        return <FiActivity className="message-icon gesture-icon" />;
      case 'error':
        return <span className="message-icon error-icon">!</span>;
      default:
        return <FiActivity className="message-icon system-icon" />;
    }
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="jarvis-interface">
      {/* Header Stats */}
      <div className="interface-header">
        <div className="stat-item">
          <span className="stat-label">System Status</span>
          <span className={`stat-value ${isActive ? 'online' : 'offline'}`}>
            {isActive ? 'OPERATIONAL' : 'OFFLINE'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Neural Net</span>
          <span className="stat-value">Gemma-4B</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Local Time</span>
          <span className="stat-value time-value">{formatTime()}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">
              <FiCpu size={48} />
            </div>
            <h2>Welcome back, Sir</h2>
            <p>I am JARVIS, your AI assistant. I am online and ready to assist you.</p>
            <div className="welcome-hints">
              <span>Use gestures to control the system</span>
              <span>Type or speak to interact</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.type}`}>
            <div className="message-avatar">
              {getMessageIcon(msg.type)}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-sender">
                  {msg.type === 'jarvis' ? 'JARVIS' : 
                   msg.type === 'user' ? 'You' : 
                   msg.type === 'gesture' ? 'Gesture' : 'System'}
                </span>
                <span className="message-time">
                  {new Date(msg.id).toLocaleTimeString('en-US', { 
                    hour12: false, 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isActive ? "Enter command or query, Sir..." : "Connecting to JARVIS..."}
            disabled={!isActive}
            className="message-input"
          />
          <div className={`typing-indicator ${isTyping ? 'visible' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="send-button"
          disabled={!input.trim() || !isActive}
        >
          <FiSend size={20} />
        </button>
      </form>

      {/* Decorative Lines */}
      <div className="hud-line top"></div>
      <div className="hud-line bottom"></div>
    </div>
  );
};

export default JarvisInterface;
