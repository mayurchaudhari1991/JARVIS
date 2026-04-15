import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ObjectManipulation.css";

const ObjectManipulation = ({
  handTrackingData,
  selectedAction,
  onObjectAction,
}) => {
  const [objects, setObjects] = useState([]);
  const [grabbedObject, setGrabbedObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const containerRef = useRef(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastPositionRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Convert hand position from normalized (0-1) to screen coordinates
  const getHandScreenPosition = useCallback((handPosition) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    // handPosition is normalized (0-1), convert to pixels
    // Mirror X because webcam is mirrored
    return {
      x: (1 - handPosition.x) * rect.width,
      y: handPosition.y * rect.height,
    };
  }, []);

  // Create new object
  const createObject = useCallback(
    (position, type = "cube") => {
      const newObject = {
        id: Date.now() + Math.random(),
        type,
        x: position.x,
        y: position.y,
        vx: 0,
        vy: 0,
        scale: 1,
        rotation: 0,
        color: ["#00d4ff", "#00ff88", "#ff6b35", "#ffcc00", "#ff00ff"][
          Math.floor(Math.random() * 5)
        ],
        createdAt: Date.now(),
      };
      setObjects((prev) => [...prev, newObject]);
      onObjectAction?.({ type: "create", object: newObject });
      return newObject;
    },
    [onObjectAction],
  );

  // Delete object
  const deleteObject = useCallback(
    (id) => {
      setObjects((prev) => prev.filter((obj) => obj.id !== id));
      if (selectedObject?.id === id) setSelectedObject(null);
      if (grabbedObject?.id === id) setGrabbedObject(null);
      onObjectAction?.({ type: "delete", id });
    },
    [selectedObject, grabbedObject, onObjectAction],
  );

  // Delete all objects
  const deleteAllObjects = useCallback(() => {
    setObjects([]);
    setSelectedObject(null);
    setGrabbedObject(null);
    onObjectAction?.({ type: "delete_all" });
  }, [onObjectAction]);

  // Find object at position
  const findObjectAtPosition = useCallback(
    (x, y, radius = 50) => {
      return objects.find((obj) => {
        const dx = obj.x - x;
        const dy = obj.y - y;
        return Math.sqrt(dx * dx + dy * dy) < radius * obj.scale;
      });
    },
    [objects],
  );

  // Handle hand tracking data
  useEffect(() => {
    if (!handTrackingData) return;

    const { type, gesture, hands } = handTrackingData;

    if (type === "dual_gesture" && gesture) {
      switch (gesture.type) {
        case "CREATE_OBJECT":
          // Always allow creation with hands together gesture
          const screenPos = getHandScreenPosition(gesture.position);
          createObject(screenPos, "cube");
          break;

        case "GRAB_START":
          // Always allow grabbing with dual pinch gesture
          const grabPos = getHandScreenPosition(gesture.position);
          const obj = findObjectAtPosition(grabPos.x, grabPos.y);
          if (obj) {
            setGrabbedObject(obj);
            lastPositionRef.current = grabPos;
            velocityRef.current = { x: 0, y: 0 };
            onObjectAction?.({ type: "grab", object: obj });
          }
          break;

        case "GRAB_MOVE":
          if (grabbedObject) {
            const screenPos = getHandScreenPosition(gesture.position);

            // Calculate velocity for throwing
            if (lastPositionRef.current) {
              velocityRef.current = {
                x: (screenPos.x - lastPositionRef.current.x) * 0.8,
                y: (screenPos.y - lastPositionRef.current.y) * 0.8,
              };
            }

            setObjects((prev) =>
              prev.map((obj) =>
                obj.id === grabbedObject.id
                  ? { ...obj, x: screenPos.x, y: screenPos.y, vx: 0, vy: 0 }
                  : obj,
              ),
            );

            lastPositionRef.current = screenPos;
          }
          break;

        case "GRAB_RELEASE":
          if (grabbedObject) {
            // Apply throw velocity
            setObjects((prev) =>
              prev.map((obj) =>
                obj.id === grabbedObject.id
                  ? {
                      ...obj,
                      vx: velocityRef.current.x,
                      vy: velocityRef.current.y,
                    }
                  : obj,
              ),
            );

            onObjectAction?.({
              type: "throw",
              object: grabbedObject,
              velocity: velocityRef.current,
            });

            setGrabbedObject(null);
            lastPositionRef.current = null;
            velocityRef.current = { x: 0, y: 0 };
          }
          break;

        case "SELECT_OBJECT":
          if (selectedAction === "select" || !selectedAction) {
            const screenPos = getHandScreenPosition(gesture.position);
            const obj = findObjectAtPosition(screenPos.x, screenPos.y);
            setSelectedObject(obj || null);
            if (obj) {
              onObjectAction?.({ type: "select", object: obj });
            }
          }
          break;

        case "EDIT_MODE":
          if (selectedAction === "edit" || !selectedAction) {
            const screenPos = getHandScreenPosition(gesture.position);
            const obj = findObjectAtPosition(screenPos.x, screenPos.y);
            if (obj && selectedObject?.id === obj.id) {
              // Cycle through colors/shapes
              setObjects((prev) =>
                prev.map((o) =>
                  o.id === obj.id ? { ...o, rotation: o.rotation + 45 } : o,
                ),
              );
            }
          }
          break;

        case "DELETE_ALL":
          // Always allow delete all with hands apart gesture
          deleteAllObjects();
          break;

        default:
          break;
      }
    }

    // Handle pinch-to-delete single object
    if (type === "hands_update" && hands.right) {
      const rightIndex = hands.right[8];
      const rightThumb = hands.right[4];
      const pinchDistance = Math.hypot(
        rightThumb.x - rightIndex.x,
        rightThumb.y - rightIndex.y,
      );

      if (pinchDistance < 0.05) {
        const screenPos = getHandScreenPosition(rightIndex);
        const obj = findObjectAtPosition(screenPos.x, screenPos.y, 40);
        if (obj) {
          deleteObject(obj.id);
        }
      }
    }
  }, [
    handTrackingData,
    selectedAction,
    grabbedObject,
    selectedObject,
    createObject,
    deleteObject,
    deleteAllObjects,
    findObjectAtPosition,
    getHandScreenPosition,
    onObjectAction,
  ]);

  // Physics simulation for thrown objects
  useEffect(() => {
    const updatePhysics = () => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id === grabbedObject?.id) return obj;

          let newVx = obj.vx * 0.95; // Friction
          let newVy = obj.vy * 0.95;
          let newX = obj.x + newVx;
          let newY = obj.y + newVy;

          // Boundary bounce
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            if (newX < 30 || newX > rect.width - 30) {
              newVx *= -0.7;
              newX = Math.max(30, Math.min(rect.width - 30, newX));
            }
            if (newY < 30 || newY > rect.height - 30) {
              newVy *= -0.7;
              newY = Math.max(30, Math.min(rect.height - 30, newY));
            }
          }

          // Stop if slow enough
          if (Math.abs(newVx) < 0.1 && Math.abs(newVy) < 0.1) {
            newVx = 0;
            newVy = 0;
          }

          return {
            ...obj,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: obj.rotation + newVx * 0.1,
          };
        }),
      );

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [grabbedObject]);

  return (
    <div className="object-manipulation" ref={containerRef}>
      <div className="objects-container">
        {objects.map((obj) => (
          <div
            key={obj.id}
            className={`manipulable-object ${obj.type} ${
              selectedObject?.id === obj.id ? "selected" : ""
            } ${grabbedObject?.id === obj.id ? "grabbed" : ""}`}
            style={{
              left: obj.x,
              top: obj.y,
              backgroundColor: obj.color,
              transform: `translate(-50%, -50%) scale(${obj.scale}) rotate(${obj.rotation}deg)`,
              boxShadow:
                selectedObject?.id === obj.id
                  ? `0 0 30px ${obj.color}`
                  : `0 0 10px ${obj.color}40`,
            }}
          >
            <div className="object-glow"></div>
            {grabbedObject?.id === obj.id && (
              <div className="grab-indicator">
                <div className="grab-ring"></div>
                <div className="grab-ring delay-1"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {grabbedObject && (
        <div className="velocity-indicator">
          <div
            className="velocity-arrow"
            style={{
              transform: `rotate(${Math.atan2(velocityRef.current.y, velocityRef.current.x)}rad)`,
              width: `${Math.min(100, Math.hypot(velocityRef.current.x, velocityRef.current.y) * 2)}px`,
            }}
          />
        </div>
      )}

      <div className="object-stats">
        <span>Objects: {objects.length}</span>
        <span>Grabbed: {grabbedObject ? "Yes" : "No"}</span>
        <span>
          Selected:{" "}
          {selectedObject
            ? "#" + selectedObject.id.toString().slice(-4)
            : "None"}
        </span>
      </div>
    </div>
  );
};

export default ObjectManipulation;
