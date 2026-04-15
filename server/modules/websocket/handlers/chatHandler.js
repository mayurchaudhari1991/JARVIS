const ollamaService = require("../../../lib/utils/ollamaService");

class ChatHandler {
  constructor(clients) {
    this.clients = clients;
  }

  async handle(clientId, message) {
    const ws = this.clients.get(clientId);
    if (!ws || !message.trim()) return;

    // Generate response via Ollama with personality
    const response = await ollamaService.chat(message);

    ws.send(
      JSON.stringify({
        type: "jarvis_response",
        text: response,
        triggeredBy: "chat",
      }),
    );
  }
}

module.exports = ChatHandler;
