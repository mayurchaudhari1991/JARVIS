const { GESTURE_COMMANDS } = require("../../../lib/config");
const ollamaService = require("../../../lib/utils/ollamaService");
const systemActions = require("../../../lib/utils/systemActions");

class GestureHandler {
  constructor(clients) {
    this.clients = clients;
  }

  async handle(clientId, gesture) {
    const ws = this.clients.get(clientId);
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
      const response = await ollamaService.acknowledgeGesture(
        gesture,
        command.description,
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
      systemActions.execute(command.action, ws);
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
}

module.exports = GestureHandler;
