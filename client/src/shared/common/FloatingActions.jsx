import React, { useEffect, useRef, useCallback, useState } from 'react';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiAnchor, 
  FiMousePointer,
  FiMove,
  FiBox
} from 'react-icons/fi';
import './FloatingActions.css';

const FloatingActions = ({ 
  selectedAction, 
  onActionSelect,
  objectCount = 0,
  handTrackingData
}) => {
  const buttonsRef = useRef([]);
  const [hoveredAction, setHoveredAction] = useState(null);
  const lastGestureTime = useRef(0);

  const actions = [
    { 
      id: 'create', 
      icon: FiPlus, 
      label: 'CREATE', 
      color: '#00ff88',
      gesture: '👐 Hands Together'
    },
    { 
      id: 'grab', 
      icon: FiAnchor, 
      label: 'GRAB', 
      color: '#00d4ff',
      gesture: '🤏🤏 Both Pinch'
    },
    { 
      id: 'select', 
      icon: FiMousePointer, 
      label: 'SELECT', 
      color: '#ffcc00',
      gesture: '🤏 Right Pinch'
    },
    { 
      id: 'edit', 
      icon: FiEdit3, 
      label: 'EDIT', 
      color: '#ff6b35',
      gesture: '👈 Left Pinch'
    },
    { 
      id: 'delete', 
      icon: FiTrash2, 
      label: 'DELETE', 
      color: '#ff4444',
      gesture: '👈👉 Hands Apart'
    }
  ];

  // Check if hand is hovering over a button
  const checkHandHover = useCallback((handPosition) => {
    if (!handPosition) return null;
    
    const screenX = (1 - handPosition.x) * window.innerWidth;
    const screenY = handPosition.y * window.innerHeight;
    
    for (let i = 0; i < buttonsRef.current.length; i++) {
      const btn = buttonsRef.current[i];
      if (!btn) continue;
      
      const rect = btn.getBoundingClientRect();
      if (screenX >= rect.left && screenX <= rect.right &&
          screenY >= rect.top && screenY <= rect.bottom) {
        return actions[i].id;
      }
    }
    return null;
  }, [actions]);

  // Handle hand tracking for gesture selection
  useEffect(() => {
    if (!handTrackingData) return;
    
    const { type, hands } = handTrackingData;
    const now = Date.now();
    
    // Throttle gesture selection
    if (now - lastGestureTime.current < 800) return;
    
    // Check right hand hover over buttons
    if (hands?.right && type === 'hands_update') {
      const hovered = checkHandHover(hands.right[8]); // Index finger tip
      
      if (hovered && hovered !== selectedAction) {
        // Check if hand is pinching to confirm selection
        const rightThumb = hands.right[4];
        const rightIndex = hands.right[8];
        const pinchDistance = Math.hypot(
          rightThumb.x - rightIndex.x,
          rightThumb.y - rightIndex.y
        );
        
        if (pinchDistance < 0.08) {
          onActionSelect(hovered);
          lastGestureTime.current = now;
          setHoveredAction(null);
        } else {
          setHoveredAction(hovered);
        }
      } else if (!hovered) {
        setHoveredAction(null);
      }
    }
    
    // Quick gesture shortcuts (no button hover needed)
    if (type === 'dual_gesture') {
      const { gesture } = handTrackingData;
      if (!gesture) return;
      
      switch (gesture.type) {
        case 'CREATE_OBJECT':
          onActionSelect('create');
          lastGestureTime.current = now;
          break;
        case 'GRAB_START':
          onActionSelect('grab');
          lastGestureTime.current = now;
          break;
        case 'DELETE_ALL':
          onActionSelect('delete');
          lastGestureTime.current = now;
          break;
        default:
          break;
      }
    }
  }, [handTrackingData, selectedAction, onActionSelect, checkHandHover]);

  return (
    <div className="floating-actions">
      <div className="actions-bar">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          const isHovered = hoveredAction === action.id;
          
          return (
            <button
              key={action.id}
              ref={el => buttonsRef.current[index] = el}
              className={`float-btn ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              onClick={() => onActionSelect(isSelected ? null : action.id)}
              style={{
                '--action-color': action.color,
                borderColor: isSelected ? action.color : undefined
              }}
            >
              <div 
                className="float-icon"
                style={{ color: isSelected ? action.color : undefined }}
              >
                <Icon size={24} />
              </div>
              <div className="float-info">
                <span className="float-label">{action.label}</span>
                <span className="float-gesture">{action.gesture}</span>
              </div>
              {isSelected && (
                <div className="float-indicator" style={{ background: action.color }}>
                  <div className="pulse-ring"></div>
                </div>
              )}
              {isHovered && !isSelected && (
                <div className="hover-indicator" style={{ background: action.color }} />
              )}
            </button>
          );
        })}
      </div>
      
      <div className="object-badge">
        <FiBox size={14} />
        <span>{objectCount}</span>
      </div>
    </div>
  );
};

export default FloatingActions;
