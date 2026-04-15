const systemActions = require("../../../lib/utils/systemActions");

class CommandHandler {
  constructor(clients) {
    this.clients = clients;
  }

  async handle(clientId, command) {
    const ws = this.clients.get(clientId);
    if (!ws) return;

    const result = systemActions.execute(command, ws);

    ws.send(
      JSON.stringify({
        type: "command_result",
        command,
        result,
      }),
    );
  }
}

module.exports = CommandHandler;
