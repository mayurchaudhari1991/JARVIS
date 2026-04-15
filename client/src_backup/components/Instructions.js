import React from 'react';
import './Instructions.css';

const Instructions = () => {
  return (
    <div className="instructions-overlay">
      <div className="instructions-panel">
        <h3>How to Use JARVIS Gesture System</h3>
        
        <div className="instruction-section">
          <h4>1. CREATE Object (🙏)</h4>
          <p>Raise <strong>BOTH hands</strong> in camera view</p>
          <p>Move hands <strong>CLOSE TOGETHER</strong> (almost touching)</p>
          <p>Keep fingers <strong>OPEN</strong> (not pinching)</p>
          <p className="tip">Look for "CREATE_OBJECT" in debug panel</p>
        </div>

        <div className="instruction-section">
          <h4>2. GRAB / MOVE Object (🤏🤏)</h4>
          <p>Pinch thumb+index on <strong>BOTH hands</strong></p>
          <p>Move hands to drag object</p>
          <p>Separate hands quickly to THROW</p>
        </div>

        <div className="instruction-section">
          <h4>3. DELETE Object (👆)</h4>
          <p>Pinch with <strong>RIGHT hand</strong> ON the object</p>
        </div>

        <div className="instruction-section">
          <h4>4. DELETE ALL (👐)</h4>
          <p>Move both hands <strong>FAR APART</strong></p>
        </div>

        <div className="debug-guide">
          <h4>Debug Panel (Top Left of Camera)</h4>
          <ul>
            <li><strong>Distance:</strong> Shows hand distance (should be &lt; 0.30 to create)</li>
            <li><strong>Left/Right Pinch:</strong> Green = pinching</li>
            <li><strong>Gesture:</strong> Shows detected gesture</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
