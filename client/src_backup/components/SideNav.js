import React from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiAnchor,
  FiMousePointer,
  FiMove,
  FiInfo,
} from "react-icons/fi";
import "./SideNav.css";

const SideNav = ({ selectedAction, onActionSelect, objectCount = 0 }) => {
  const actions = [
    {
      id: "create",
      icon: FiPlus,
      label: "Create",
      description: "Bring hands together to create object",
      color: "#00ff88",
    },
    {
      id: "grab",
      icon: FiAnchor,
      label: "Grab/Throw",
      description: "Pinch both hands to grab, separate to throw",
      color: "#00d4ff",
    },
    {
      id: "select",
      icon: FiMousePointer,
      label: "Select",
      description: "Right hand pinch to select object",
      color: "#ffcc00",
    },
    {
      id: "edit",
      icon: FiEdit3,
      label: "Edit",
      description: "Left hand pinch + pinch selected object to rotate",
      color: "#ff6b35",
    },
    {
      id: "delete",
      icon: FiTrash2,
      label: "Delete",
      description:
        "Move hands far apart to delete all, or pinch to delete single",
      color: "#ff4444",
    },
    {
      id: "move",
      icon: FiMove,
      label: "Free Move",
      description: "Use hand position to move freely",
      color: "#ff00ff",
    },
  ];

  return (
    <div className="side-nav">
      <div className="nav-header">
        <h3>
          <FiAnchor className="nav-icon" />
          Gesture Actions
        </h3>
        <div className="object-count">
          <span>{objectCount}</span>
          <small>objects</small>
        </div>
      </div>

      <div className="actions-list">
        {actions.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;

          return (
            <button
              key={action.id}
              className={`action-btn ${isSelected ? "selected" : ""}`}
              onClick={() => onActionSelect(isSelected ? null : action.id)}
              style={{
                "--action-color": action.color,
                borderColor: isSelected ? action.color : undefined,
              }}
            >
              <div
                className="action-icon"
                style={{ color: isSelected ? action.color : undefined }}
              >
                <Icon size={22} />
              </div>
              <div className="action-info">
                <span className="action-label">{action.label}</span>
                <span className="action-desc">{action.description}</span>
              </div>
              {isSelected && (
                <div
                  className="active-indicator"
                  style={{ background: action.color }}
                >
                  <div className="pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="gesture-guide">
        <div className="guide-header">
          <FiInfo size={14} />
          <span>Quick Guide</span>
        </div>
        <div className="guide-content">
          <div className="guide-item">
            <span className="hand-emoji">👐</span>
            <span>Both hands together = Create</span>
          </div>
          <div className="guide-item">
            <span className="hand-emoji">🤏🤏</span>
            <span>Both pinch = Grab</span>
          </div>
          <div className="guide-item">
            <span className="hand-emoji">👈👉</span>
            <span>Hands apart = Delete All</span>
          </div>
          <div className="guide-item">
            <span className="hand-emoji">🤏</span>
            <span>Single pinch = Edit/Select/Delete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
