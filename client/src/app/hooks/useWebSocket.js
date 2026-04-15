import { useEffect, useRef, useState, useCallback } from 'react';

export default function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setReadyState(1);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setReadyState(3);
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`Reconnection attempt ${reconnectAttemptsRef.current}`);
            connect();
          }, 3000 * (reconnectAttemptsRef.current + 1));
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setReadyState(3);
      };

      wsRef.current = ws;
      setReadyState(0);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setReadyState(3);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(data);
      return true;
    }
    console.warn('WebSocket not connected');
    return false;
  }, []);

  return { sendMessage, lastMessage, readyState };
}
