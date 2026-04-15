import { useEffect, useRef, useState, useCallback } from "react";

export default function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (
      isConnectingRef.current ||
      (wsRef.current && wsRef.current.readyState === 1)
    ) {
      return;
    }

    // Clean up any existing connection
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // Ignore cleanup errors
      }
      wsRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    isConnectingRef.current = true;

    try {
      console.log("Connecting to WebSocket...");
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setReadyState(1);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed", event.code, event.reason);
        setReadyState(3);
        isConnectingRef.current = false;

        // Don't reconnect if it was a clean close
        if (event.code === 1000 || event.code === 1001) {
          return;
        }

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay =
            RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current);
          console.log(
            `Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setReadyState(3);
        isConnectingRef.current = false;
      };

      wsRef.current = ws;
      setReadyState(0);
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setReadyState(3);
      isConnectingRef.current = false;
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (wsRef.current) {
        // Use code 1000 for clean close
        try {
          wsRef.current.close(1000, "Component unmounting");
        } catch (e) {
          // Ignore cleanup errors
        }
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      try {
        wsRef.current.send(data);
        return true;
      } catch (error) {
        console.error("Failed to send message:", error);
        return false;
      }
    }
    console.warn(
      "WebSocket not connected, readyState:",
      wsRef.current?.readyState,
    );
    return false;
  }, []);

  return { sendMessage, lastMessage, readyState };
}
