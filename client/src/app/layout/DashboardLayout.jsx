import React from "react";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = ({ connectionStatus }) => {
  return (
    <div className="jarvis-app">
      {/* Minimal Header */}
      <header className="minimal-header">
        <div className="header-left">
          <div className="jarvis-logo">
            <span className="logo-dot"></span>
            <span className="logo-text">JARVIS</span>
          </div>
        </div>
        <div className="header-right">
          <div className={`connection-pill ${connectionStatus}`}>
            <span className="pulse-dot"></span>
            <span>{connectionStatus}</span>
          </div>
        </div>
      </header>

      {/* Fullscreen Main Content */}
      <main className="fullscreen-main">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="minimal-footer">
        <span className="footer-text">Dual-Hand Gesture Control</span>
      </footer>
    </div>
  );
};

export default DashboardLayout;
