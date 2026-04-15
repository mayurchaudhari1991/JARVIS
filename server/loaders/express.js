const express = require("express");
const cors = require("cors");
const { errorHandler } = require("../middleware");
const { GESTURE_COMMANDS, OLLAMA_URL } = require("../lib/config");
const ollamaService = require("../lib/utils/ollamaService");

class ExpressLoader {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // Health check
    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "operational",
        service: "JARVIS",
        ollama: OLLAMA_URL,
        timestamp: new Date().toISOString(),
      });
    });

    // Get available gestures
    this.app.get("/api/gestures", (req, res) => {
      res.json(GESTURE_COMMANDS);
    });

    // Chat endpoint
    this.app.post("/api/chat", async (req, res) => {
      try {
        const { message } = req.body;
        if (!message) {
          return res.status(400).json({
            type: "error",
            message: "Message is required",
          });
        }
        
        const response = await ollamaService.chat(message);
        res.json({ 
          response,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
          type: "error",
          message: "Failed to process chat message",
        });
      }
    });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }

  getApp() {
    return this.app;
  }
}

module.exports = ExpressLoader;
