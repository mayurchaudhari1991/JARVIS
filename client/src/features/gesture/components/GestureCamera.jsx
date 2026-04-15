import React, { useEffect, useRef, useState, useCallback } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import "./GestureCamera.css";

const GestureCamera = ({
  onGestureDetected,
  onHandTracking,
  lastGesture,
  selectedAction,
  mode = "dual", // 'single' or 'dual'
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState(null);
  const [fps, setFps] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [handsData, setHandsData] = useState({ left: null, right: null });
  const [debugInfo, setDebugInfo] = useState({
    handDistance: 0,
    leftPinch: false,
    rightPinch: false,
    gesture: null,
  });
  const gestureHistory = useRef([]);
  const lastGestureTime = useRef(0);
  const fpsCounter = useRef({ frames: 0, lastTime: Date.now() });
  const pinchStartRef = useRef(null);
  const isGrabbingRef = useRef(false);
  const lastCreateTime = useRef(0);

  // Enhanced Gesture Detection for Single Hand
  const detectGesture = useCallback((landmarks, isLeftHand = false) => {
    const fingers = [];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];

    // Check if fingers are extended
    const isFingerExtended = (tip, mcp) => {
      const distanceTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const distanceMcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
      return distanceTip > distanceMcp * 1.2;
    };

    fingers.push(isFingerExtended(index, landmarks[5]));
    fingers.push(isFingerExtended(middle, landmarks[9]));
    fingers.push(isFingerExtended(ring, landmarks[13]));
    fingers.push(isFingerExtended(pinky, landmarks[17]));

    // Thumb detection
    const pinkyMCP = landmarks[17];
    const thumbExtended =
      Math.hypot(thumb.x - pinkyMCP.x, thumb.y - pinkyMCP.y) > 0.3;

    const extendedCount = fingers.filter((f) => f).length;
    const handUp = middle.y < wrist.y;

    // Pinch detection (for grabbing)
    const pinchDistance = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    const isPinching = pinchDistance < 0.08;

    // Pointing detection
    const pointingUp = index.y < middleMCP.y && fingers[0] && !fingers[1];
    const pointingDown = index.y > middleMCP.y && fingers[0] && !fingers[1];

    // Basic gestures
    if (extendedCount === 0) {
      if (thumbExtended) {
        return isLeftHand
          ? thumb.y < wrist.y
            ? "LEFT_THUMBS_UP"
            : "LEFT_THUMBS_DOWN"
          : thumb.y < wrist.y
            ? "THUMBS_UP"
            : "THUMBS_DOWN";
      }
      return isLeftHand ? "LEFT_FIST" : "FIST";
    }

    if (extendedCount === 4 && !thumbExtended) {
      return isLeftHand ? "LEFT_OPEN_PALM" : "OPEN_PALM";
    }

    if (extendedCount === 2 && fingers[0] && fingers[1]) {
      return isLeftHand ? "LEFT_VICTORY" : "VICTORY";
    }

    if (isPinching) {
      return isLeftHand ? "LEFT_PINCH" : "PINCH";
    }

    if (pointingUp) return isLeftHand ? "LEFT_POINT_UP" : "POINTING_UP";
    if (pointingDown) return isLeftHand ? "LEFT_POINT_DOWN" : "POINTING_DOWN";

    return null;
  }, []);

  // Dual Hand Interaction Detection
  const detectDualHandGesture = useCallback((leftHand, rightHand) => {
    if (!leftHand || !rightHand) return null;

    const leftWrist = leftHand[0];
    const rightWrist = rightHand[0];
    const leftIndex = leftHand[8];
    const rightIndex = rightHand[8];
    const leftThumb = leftHand[4];
    const rightThumb = rightHand[4];

    // Calculate hand distance
    const handDistance = Math.hypot(
      leftWrist.x - rightWrist.x,
      leftWrist.y - rightWrist.y,
    );

    // Calculate pinch states
    const leftPinch =
      Math.hypot(leftThumb.x - leftIndex.x, leftThumb.y - leftIndex.y) < 0.08;
    const rightPinch =
      Math.hypot(rightThumb.x - rightIndex.x, rightThumb.y - rightIndex.y) <
      0.08;

    // Update debug info
    setDebugInfo({
      handDistance: handDistance.toFixed(3),
      leftPinch,
      rightPinch,
      gesture: null,
    });

    // Both hands pinching = GRAB
    if (leftPinch && rightPinch) {
      const centerX = (leftIndex.x + rightIndex.x) / 2;
      const centerY = (leftIndex.y + rightIndex.y) / 2;

      if (!isGrabbingRef.current) {
        isGrabbingRef.current = true;
        pinchStartRef.current = { x: centerX, y: centerY };
        return {
          type: "GRAB_START",
          position: { x: centerX, y: centerY },
          handDistance,
        };
      }
      return {
        type: "GRAB_MOVE",
        position: { x: centerX, y: centerY },
        delta: pinchStartRef.current
          ? {
              x: centerX - pinchStartRef.current.x,
              y: centerY - pinchStartRef.current.y,
            }
          : { x: 0, y: 0 },
        handDistance,
      };
    } else {
      if (isGrabbingRef.current) {
        isGrabbingRef.current = false;
        const releasePosition = pinchStartRef.current;
        pinchStartRef.current = null;
        return {
          type: "GRAB_RELEASE",
          position: releasePosition,
          velocity: { x: 0, y: 0 }, // Could calculate from movement history
        };
      }
    }

    // Hands close together = CREATE (lower threshold for easier triggering)
    // Only trigger when hands are clearly close but not pinching
    if (handDistance < 0.25 && !leftPinch && !rightPinch) {
      const now = Date.now();
      // Throttle creation to once per 800ms
      if (now - lastCreateTime.current > 800) {
        lastCreateTime.current = now;
        const centerX = (leftWrist.x + rightWrist.x) / 2;
        const centerY = (leftWrist.y + rightWrist.y) / 2;
        setDebugInfo((prev) => ({
          ...prev,
          handDistance: handDistance.toFixed(3),
          gesture: "CREATE_OBJECT",
          leftPinch: false,
          rightPinch: false,
        }));
        return {
          type: "CREATE_OBJECT",
          position: { x: centerX, y: centerY },
          handDistance,
        };
      }
    }

    // Hands moving apart = DELETE
    if (handDistance > 0.5) {
      return { type: "DELETE_ALL" };
    }

    // Left hand pinch only = EDIT mode
    if (leftPinch && !rightPinch) {
      return {
        type: "EDIT_MODE",
        position: { x: leftIndex.x, y: leftIndex.y },
      };
    }

    // Right hand pinch only = SELECT/INTERACT
    if (rightPinch && !leftPinch) {
      return {
        type: "SELECT_OBJECT",
        position: { x: rightIndex.x, y: rightIndex.y },
      };
    }

    // Clapping motion (hands coming together quickly)
    if (handDistance < 0.1) {
      return { type: "CLAP" };
    }

    return null;
  }, []);

  // Debounced gesture reporting
  const reportGesture = useCallback(
    (gestureName) => {
      const now = Date.now();

      // Add to history
      gestureHistory.current.push({ gesture: gestureName, time: now });
      gestureHistory.current = gestureHistory.current.filter(
        (g) => now - g.time < 500,
      );

      // Check if gesture is consistent in last 500ms
      const recentGestures = gestureHistory.current.filter(
        (g) => g.gesture === gestureName,
      );

      if (recentGestures.length >= 3 && now - lastGestureTime.current > 1000) {
        lastGestureTime.current = now;
        setGesture(gestureName);
        onGestureDetected({
          name: gestureName,
          confidence: recentGestures.length / gestureHistory.current.length,
        });

        // Clear gesture after animation
        setTimeout(() => setGesture(null), 1500);
      }
    },
    [onGestureDetected],
  );

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const handsRef = { current: null };
    const cameraRef = { current: null };
    const isActiveRef = { current: true };
    const frameProcessingRef = { current: false };

    const initializeHands = async () => {
      try {
        handsRef.current = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        handsRef.current.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        handsRef.current.onResults((results) => {
          if (!isActiveRef.current || !canvasRef.current) return;

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          // Update FPS
          const now = Date.now();
          fpsCounter.current.frames++;
          if (now - fpsCounter.current.lastTime >= 1000) {
            setFps(fpsCounter.current.frames);
            fpsCounter.current.frames = 0;
            fpsCounter.current.lastTime = now;
          }

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          let leftHand = null;
          let rightHand = null;

          if (
            results.multiHandLandmarks &&
            results.multiHandLandmarks.length > 0
          ) {
            // Process hands and determine left/right
            results.multiHandLandmarks.forEach((landmarks, index) => {
              const handedness = results.multiHandedness?.[index]?.label;

              // Draw hand landmarks
              const color = handedness === "Left" ? "#00ff88" : "#00d4ff";
              ctx.strokeStyle = color;
              ctx.lineWidth = 2;
              ctx.fillStyle = color;

              // Draw connections
              const connections = [
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 4],
                [0, 5],
                [5, 6],
                [6, 7],
                [7, 8],
                [0, 9],
                [9, 10],
                [10, 11],
                [11, 12],
                [0, 13],
                [13, 14],
                [14, 15],
                [15, 16],
                [0, 17],
                [17, 18],
                [18, 19],
                [19, 20],
                [5, 9],
                [9, 13],
                [13, 17],
              ];

              connections.forEach(([i, j]) => {
                const p1 = landmarks[i];
                const p2 = landmarks[j];
                ctx.beginPath();
                ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
                ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
                ctx.stroke();
              });

              // Draw landmarks
              landmarks.forEach((point) => {
                ctx.beginPath();
                ctx.arc(
                  point.x * canvas.width,
                  point.y * canvas.height,
                  4,
                  0,
                  2 * Math.PI,
                );
                ctx.fill();
              });

              // Store hand data
              if (handedness === "Left") {
                leftHand = landmarks;
              } else {
                rightHand = landmarks;
              }

              // Detect single hand gestures
              const detectedGesture = detectGesture(
                landmarks,
                handedness === "Left",
              );
              if (detectedGesture) {
                reportGesture(detectedGesture);
              }
            });

            // Update hands data state
            setHandsData({ left: leftHand, right: rightHand });

            // Detect dual hand gestures
            if (leftHand && rightHand && onHandTracking) {
              const dualGesture = detectDualHandGesture(leftHand, rightHand);
              if (dualGesture) {
                onHandTracking({
                  type: "dual_gesture",
                  gesture: dualGesture,
                  hands: { left: leftHand, right: rightHand },
                });
              }
            }

            // Send tracking data
            if (onHandTracking) {
              onHandTracking({
                type: "hands_update",
                hands: { left: leftHand, right: rightHand },
              });
            }
          }
        });

        // Wait for hands to be ready
        await new Promise((resolve) => setTimeout(resolve, 500));

        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            if (
              !isActiveRef.current ||
              !handsRef.current ||
              frameProcessingRef.current
            )
              return;
            frameProcessingRef.current = true;
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (err) {
              // Frame processing error - ignore
            } finally {
              frameProcessingRef.current = false;
            }
          },
          width: 640,
          height: 480,
        });

        await cameraRef.current.start();
        if (isActiveRef.current) {
          setIsInitialized(true);
          console.log("Camera initialized");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setIsInitialized(false);
      }
    };

    initializeHands();

    return () => {
      isActiveRef.current = false;

      // Stop camera first, then close hands
      const cleanup = async () => {
        // Wait for any pending frame processing
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (cameraRef.current) {
          try {
            await cameraRef.current.stop();
          } catch (e) {}
          cameraRef.current = null;
        }

        // Wait again before closing hands
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (handsRef.current) {
          try {
            handsRef.current.close();
          } catch (e) {}
          handsRef.current = null;
        }
      };

      cleanup();
    };
  }, [detectGesture, reportGesture, detectDualHandGesture, onHandTracking]);

  const getGestureDisplay = (gestureName) => {
    const displays = {
      THUMBS_UP: { icon: "👍", label: "Confirm", color: "#00ff88" },
      THUMBS_DOWN: { icon: "👎", label: "Cancel", color: "#ff4444" },
      OPEN_PALM: { icon: "✋", label: "Stop", color: "#ffcc00" },
      FIST: { icon: "✊", label: "Activate", color: "#00d4ff" },
      POINTING_UP: { icon: "☝️", label: "Increase", color: "#00ff88" },
      POINTING_DOWN: { icon: "👇", label: "Decrease", color: "#ff6b35" },
      VICTORY: { icon: "✌️", label: "Screenshot", color: "#ff00ff" },
      OK_SIGN: { icon: "👌", label: "Execute", color: "#00ff88" },
      SHAKA: { icon: "🤙", label: "Relax", color: "#ffcc00" },
    };
    return (
      displays[gestureName] || { icon: "✋", label: "Unknown", color: "#888" }
    );
  };

  return (
    <div className="gesture-camera">
      <div className="camera-container">
        <video ref={videoRef} className="camera-video" playsInline muted />
        <canvas
          ref={canvasRef}
          className="camera-canvas"
          width={640}
          height={480}
        />

        {!isInitialized && (
          <div className="camera-loading">
            <div className="loading-spinner"></div>
            <span>Initializing Camera...</span>
          </div>
        )}

        <div className="camera-overlay">
          <div className="fps-counter">{fps} FPS</div>
          <div className="tracking-status">
            {gesture ? "Tracking" : "Searching..."}
          </div>

          {/* Debug Info */}
          <div className="debug-overlay">
            <div className="debug-item">
              <span className="debug-label">Distance:</span>
              <span
                className={`debug-value ${parseFloat(debugInfo.handDistance) < 0.25 ? "ready" : ""}`}
              >
                {debugInfo.handDistance}
              </span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Left:</span>
              <span
                className={`debug-badge ${debugInfo.leftPinch ? "active" : ""}`}
              >
                {debugInfo.leftPinch ? "Pinch" : "Open"}
              </span>
            </div>
            <div className="debug-item">
              <span className="debug-label">Right:</span>
              <span
                className={`debug-badge ${debugInfo.rightPinch ? "active" : ""}`}
              >
                {debugInfo.rightPinch ? "Pinch" : "Open"}
              </span>
            </div>
            {parseFloat(debugInfo.handDistance) < 0.25 &&
              !debugInfo.leftPinch &&
              !debugInfo.rightPinch && (
                <div className="create-ready">🙏 CREATE</div>
              )}
          </div>
        </div>

        {/* Corner Decorations */}
        <div className="corner-tl"></div>
        <div className="corner-tr"></div>
        <div className="corner-bl"></div>
        <div className="corner-br"></div>
      </div>

      {/* Gesture Display */}
      <div className={`gesture-display ${gesture ? "active" : ""}`}>
        {gesture && (
          <>
            <div
              className="gesture-icon-large"
              style={{ color: getGestureDisplay(gesture).color }}
            >
              {getGestureDisplay(gesture).icon}
            </div>
            <div
              className="gesture-label"
              style={{ color: getGestureDisplay(gesture).color }}
            >
              {getGestureDisplay(gesture).label}
            </div>
          </>
        )}
      </div>

      {/* Last Gesture Info */}
      {lastGesture && (
        <div className="last-gesture">
          <span>Last: {getGestureDisplay(lastGesture.name).label}</span>
          <span className="gesture-time">
            {Math.round((Date.now() - lastGesture.timestamp) / 1000)}s ago
          </span>
        </div>
      )}
    </div>
  );
};

export default GestureCamera;
