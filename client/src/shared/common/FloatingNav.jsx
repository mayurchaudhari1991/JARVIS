import React, { useState } from 'react';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiAnchor, 
  FiMousePointer,
  FiMenu,
  FiX,
  FiMonitor,
  FiHelpCircle
} from 'react-icons/fi';
import './FloatingNav.css';

const FloatingNav = ({ 
  selectedAction, 
  onActionSelect,
  objectCount = 0,
  onScreenShare,
  onShowHelp
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { 
      id: 'create', 
      icon: FiPlus, 
      label: 'Create', 
      color: '#00ff88',
      gesture: '🙏 Hands Close'
    },
    { 
      id: 'grab', 
      icon: FiAnchor, 
      label: 'Grab', 
      color: '#00d4ff',
      gesture: '🤏🤏 Both Pinch'
    },
    { 
      id: 'select', 
      icon: FiMousePointer, 
      label: 'Select', 
      color: '#ffcc00',
      gesture: '🤏 Right Pinch'
    },
    { 
      id: 'edit', 
      icon: FiEdit3, 
      label: 'Edit', 
      color: '#ff6b35',
      gesture: '👈 Left Pinch'
    },
    { 
      id: 'delete', 
      icon: FiTrash2, 
      label: 'Delete', 
      color: '#ff4757',
      gesture: '👐 Hands Apart'
    },
  ];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (actionId) => {
    onActionSelect(actionId === selectedAction ? null : actionId);
    // Keep expanded for a moment then collapse
    setTimeout(() => setIsExpanded(false), 300);
  };

  return (
    <div className={`floating-nav ${isExpanded ? 'expanded' : ''}`}>
      {/* Main Toggle Button */}
      <button 
        className="nav-toggle"
        onClick={toggleExpand}
        title={isExpanded ? 'Close menu' : 'Open menu'}
      >
        {isExpanded ? <FiX /> : <FiMenu />}
      </button>

      {/* Action Buttons */}
      <div className="nav-actions">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              className={`nav-action ${isSelected ? 'selected' : ''}`}
              style={{ 
                '--action-color': action.color,
                '--delay': `${index * 0.05}s`
              }}
              onClick={() => handleActionClick(action.id)}
              title={`${action.label} - ${action.gesture}`}
            >
              <Icon className="action-icon" />
              <span className="action-label">{action.label}</span>
              {isSelected && <span className="active-indicator"></span>}
            </button>
          );
        })}
      </div>

      {/* Secondary Actions */}
      <div className="nav-secondary">
        <button 
          className="nav-secondary-btn"
          onClick={onScreenShare}
          title="Screen Share"
        >
          <FiMonitor />
        </button>
        <button 
          className="nav-secondary-btn"
          onClick={onShowHelp}
          title="Help"
        >
          <FiHelpCircle />
        </button>
      </div>

      {/* Object Counter */}
      <div className="object-counter">
        <span className="counter-value">{objectCount}</span>
        <span className="counter-label">objects</span>
      </div>
    </div>
  );
};

export default FloatingNav;
