import React from 'react';
import { Outlet } from 'react-router-dom';
import './DashboardLayout.css';

const DashboardLayout = ({ connectionStatus }) => {
  return (
    <div className="app">
      <div className="app-background">
        <div className="grid-overlay"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-ring ring-1"></div>
            <div className="logo-ring ring-2"></div>
            <div className="logo-ring ring-3"></div>
            <span className="logo-text">J</span>
          </div>
          <div className="logo-title">
            <h1>J.A.R.V.I.S.</h1>
            <span>Dual-Hand Gesture System</span>
          </div>
        </div>
        
        <div className="header-controls">
          <div className={`status-indicator ${connectionStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">{connectionStatus}</span>
          </div>
        </div>
      </header>

      <main className="app-main immersive">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
