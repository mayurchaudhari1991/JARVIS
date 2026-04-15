import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Layout
import DashboardLayout from './app/layout/DashboardLayout';

// Shared hooks
import useWebSocket from './app/hooks/useWebSocket';

// Feature pages
import JarvisDashboard from './features/gesture/pages/JarvisDashboard';

function App() {
  const [isActive, setIsActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:5000');

  // Handle WebSocket connection status
  useEffect(() => {
    const statusMap = { 0: 'connecting', 1: 'connected', 2: 'closing', 3: 'disconnected' };
    setConnectionStatus(statusMap[readyState] || 'unknown');
  }, [readyState]);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'connection') {
        setIsActive(true);
      }
    }
  }, [lastMessage]);

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout connectionStatus={connectionStatus} />}>
        <Route 
          index 
          element={
            <JarvisDashboard 
              isActive={isActive}
              connectionStatus={connectionStatus}
              sendMessage={sendMessage}
              lastMessage={lastMessage}
              readyState={readyState}
            />
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
