const WebSocket = require("ws");
const {
  GestureHandler,
  VoiceHandler,
  ChatHandler,
  CommandHandler,
} = require("./handlers");

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();
    
    // Initialize handlers
    this.handlers = {
      gesture: new GestureHandler(this.clients),
      voice: new VoiceHandler(this.clients),
      chat: new ChatHandler(this.clients),
      command: new CommandHandler(this.clients),
    };

    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on("connection", (ws, req) => {
      const clientId = Date.now();
      this.clients.set(clientId, ws);

      console.log(
        `Client ${clientId} connected. Total clients: ${this.clients.size}`,
      );

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
          await this.handleMessage(clientId, data);
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
        this.clients.delete(clientId);
        console.log(
          `Client ${clientId} disconnected. Total clients: ${this.clients.size}`,
        );
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  async handleMessage(clientId, data) {
    const ws = this.clients.get(clientId);
    if (!ws) return;

    const handler = this.handlers[data.type];
    
    if (handler) {
      switch (data.type) {
        case "gesture":
          await handler.handle(clientId, data.gesture);
          break;
        case "voice":
          await handler.handle(clientId, data.text);
          break;
        case "chat":
          await handler.handle(clientId, data.message);
          break;
        case "command":
          await handler.handle(clientId, data.command);
          break;
        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            }),
          );
      }
    } else {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Unknown message type",
        }),
      );
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

module.exports = WebSocketService;
