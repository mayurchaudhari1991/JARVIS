const http = require("http");
const { ExpressLoader } = require("./loaders");
const WebSocketService = require("./modules/websocket");
const { PORT } = require("./lib/config");

async function startServer() {
  try {
    // Initialize Express
    const expressLoader = new ExpressLoader();
    const app = expressLoader.getApp();
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize WebSocket
    const wsService = new WebSocketService(server);
    
    // Update health endpoint with client count
    app.get("/api/health", (req, res) => {
      res.json({
        status: "operational",
        service: "JARVIS",
        ollama: process.env.OLLAMA_URL || "http://localhost:11434",
        clients: wsService.getClientCount(),
        timestamp: new Date().toISOString(),
      });
    });
    
    // Start server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     J.A.R.V.I.S. Gesture Control Server        ║
║                                                ║
║     Status: ONLINE                             ║
║     Port: ${PORT}                              ${PORT === 5000 ? " " : ""}   ║
║     Ollama: ${process.env.OLLAMA_URL || "http://localhost:11434"}        ║
║                                                ║
╚════════════════════════════════════════════════╝
      `);
    });
    
    return { app, server, wsService };
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = { startServer };
