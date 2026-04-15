const ollamaService = require("../../../lib/utils/ollamaService");

class VoiceHandler {
  constructor(clients) {
    this.clients = clients;
  }

  async handle(clientId, text) {
    const ws = this.clients.get(clientId);
    if (!ws || !text.trim()) return;

    // Send voice recognition acknowledgment
    ws.send(
      JSON.stringify({
        type: "voice_recognized",
        text,
      }),
    );

    // Generate response via Ollama
    const response = await ollamaService.acknowledgeVoice(text);

    ws.send(
      JSON.stringify({
        type: "jarvis_response",
        text: response,
        triggeredBy: "voice",
      }),
    );
  }
}

module.exports = VoiceHandler;
