const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");
const axios = require("axios");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

// Middleware
app.use(cors());
app.use(express.json());

// Store active connections
const clients = new Map();

// JARVIS Context/Personality
const JARVIS_PERSONALITY = `You are JARVIS (Just A Rather Very Intelligent System), an advanced AI assistant inspired by the Iron Man movies. You are:
- Professional, witty, and slightly sarcastic in a friendly way
- Highly capable and efficient
- Address the user as "Sir" or "Ma'am"
- Provide concise but helpful responses
- If you don't know something, admit it gracefully
- Keep responses under 3 sentences when possible unless detailed explanation is needed`;

// Gesture to Command Mapping
const GESTURE_COMMANDS = {
  THUMBS_UP: { action: "confirm", description: "Confirm/Yes" },
  THUMBS_DOWN: { action: "cancel", description: "Cancel/No" },
  OPEN_PALM: { action: "stop", description: "Stop/Halt" },
  FIST: { action: "activate", description: "Activate/Start" },
  POINTING_UP: { action: "increase", description: "Increase/Up" },
  POINTING_DOWN: { action: "decrease", description: "Decrease/Down" },
  VICTORY: { action: "screenshot", description: "Take Screenshot" },
  OK_SIGN: { action: "execute", description: "Execute Command" },
  WAVE: { action: "greet", description: "Greeting" },
  SHAKA: { action: "relax", description: "Relax Mode" },
};

// WebSocket Connection Handler
wss.on("connection", (ws, req) => {
  const clientId = Date.now();
  clients.set(clientId, ws);

  console.log(`Client ${clientId} connected. Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "connection",
      message: "Connected to JARVIS",
      clientId,
    }),
  );

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "gesture":
          await handleGesture(clientId, data.gesture);
          break;
        case "voice":
          await handleVoiceCommand(clientId, data.text);
          break;
        case "chat":
          await handleChat(clientId, data.message);
          break;
        case "command":
          await handleSystemCommand(clientId, data.command);
          break;
        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            }),
          );
      }
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Failed to process message",
        }),
      );
    }
  });

  ws.on("close", () => {
    clients.delete(clientId);
    console.log(
      `Client ${clientId} disconnected. Total clients: ${clients.size}`,
    );
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Handle Gesture Input
async function handleGesture(clientId, gesture) {
  const ws = clients.get(clientId);
  if (!ws) return;

  const command = GESTURE_COMMANDS[gesture];

  if (command) {
    // Send command acknowledgment
    ws.send(
      JSON.stringify({
        type: "gesture_recognized",
        gesture,
        command: command.action,
        description: command.description,
      }),
    );

    // Generate response via Ollama
    const response = await queryOllama(
      `The user performed the "${gesture}" gesture (${command.description}). ` +
        `Acknowledge this action briefly as JARVIS would.`,
    );

    ws.send(
      JSON.stringify({
        type: "jarvis_response",
        text: response,
        triggeredBy: "gesture",
        gesture,
      }),
    );

    // Execute system action if applicable
    executeSystemAction(command.action, ws);
  } else {
    ws.send(
      JSON.stringify({
        type: "gesture_unknown",
        gesture,
        message: "Gesture not recognized in command database",
      }),
    );
  }
}

// Handle Voice/Text Commands
async function handleVoiceCommand(clientId, text) {
  const ws = clients.get(clientId);
  if (!ws) return;

  ws.send(
    JSON.stringify({
      type: "voice_recognized",
      text,
    }),
  );

  const response = await queryOllama(
    `User said: "${text}". Respond as JARVIS would.`,
    true,
  );

  ws.send(
    JSON.stringify({
      type: "jarvis_response",
      text: response,
      triggeredBy: "voice",
    }),
  );
}

// Handle Chat Messages
async function handleChat(clientId, message) {
  const ws = clients.get(clientId);
  if (!ws) return;

  const response = await queryOllama(message, true);

  ws.send(
    JSON.stringify({
      type: "jarvis_response",
      text: response,
      triggeredBy: "chat",
    }),
  );
}

// Handle System Commands
async function handleSystemCommand(clientId, command) {
  const ws = clients.get(clientId);
  if (!ws) return;

  const result = executeSystemAction(command, ws);

  ws.send(
    JSON.stringify({
      type: "command_result",
      command,
      result,
    }),
  );
}

// Query Ollama Gemma 4B
async function queryOllama(prompt, usePersonality = false) {
  try {
    const systemPrompt = usePersonality ? JARVIS_PERSONALITY : "";
    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\nUser: ${prompt}\nJARVIS:`
      : prompt;

    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: "gemma:2b",
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 150,
        },
      },
      {
        timeout: 30000,
      },
    );

    return response.data.response.trim();
  } catch (error) {
    console.error("Ollama query error:", error.message);
    return "I apologize, Sir, but I'm having trouble connecting to my neural networks. Please check if Ollama is running.";
  }
}

// Execute System Actions
function executeSystemAction(action, ws) {
  const actions = {
    activate: () => {
      ws.send(
        JSON.stringify({ type: "ui_command", command: "activate_overlay" }),
      );
      return "System activated";
    },
    stop: () => {
      ws.send(
        JSON.stringify({ type: "ui_command", command: "deactivate_overlay" }),
      );
      return "System standby";
    },
    screenshot: () => {
      ws.send(
        JSON.stringify({ type: "ui_command", command: "take_screenshot" }),
      );
      return "Screenshot captured";
    },
    confirm: () => "Action confirmed",
    cancel: () => "Action cancelled",
    increase: () => {
      ws.send(JSON.stringify({ type: "ui_command", command: "volume_up" }));
      return "Increasing volume";
    },
    decrease: () => {
      ws.send(JSON.stringify({ type: "ui_command", command: "volume_down" }));
      return "Decreasing volume";
    },
    greet: () => "Greetings, Sir",
    relax: () => "Entering relaxation mode",
    execute: () => {
      ws.send(
        JSON.stringify({ type: "ui_command", command: "execute_pending" }),
      );
      return "Executing pending command";
    },
  };

  const executor = actions[action];
  return executor ? executor() : "Unknown action";
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "operational",
    service: "JARVIS",
    ollama: OLLAMA_URL,
    clients: clients.size,
  });
});

app.get("/api/gestures", (req, res) => {
  res.json(GESTURE_COMMANDS);
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const response = await queryOllama(message, true);
  res.json({ response });
});

// Start Server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     J.A.R.V.I.S. Gesture Control Server        ║
║                                                ║
║     Status: ONLINE                             ║
║     Port: ${PORT}                              ${PORT === 5000 ? " " : ""}   ║
║     Ollama: ${OLLAMA_URL}        ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
