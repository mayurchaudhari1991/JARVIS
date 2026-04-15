// System Action Executor
class SystemActions {
  constructor() {
    this.actions = {
      activate: (ws) => {
        ws.send(
          JSON.stringify({ type: "ui_command", command: "activate_overlay" }),
        );
        return "System activated";
      },
      stop: (ws) => {
        ws.send(
          JSON.stringify({ type: "ui_command", command: "deactivate_overlay" }),
        );
        return "System standby";
      },
      screenshot: (ws) => {
        ws.send(
          JSON.stringify({ type: "ui_command", command: "take_screenshot" }),
        );
        return "Screenshot captured";
      },
      confirm: () => "Action confirmed",
      cancel: () => "Action cancelled",
      increase: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "volume_up" }));
        return "Increasing volume";
      },
      decrease: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "volume_down" }));
        return "Decreasing volume";
      },
      greet: () => "Greetings, Sir",
      relax: () => "Entering relaxation mode",
      execute: (ws) => {
        ws.send(
          JSON.stringify({ type: "ui_command", command: "execute_pending" }),
        );
        return "Executing pending command";
      },
      // Object manipulation actions
      create: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "create_object" }));
        return "Creating object";
      },
      delete_all: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "delete_all_objects" }));
        return "Deleting all objects";
      },
      grab: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "grab_start" }));
        return "Grab started";
      },
      grab_move: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "grab_move" }));
        return "Moving object";
      },
      release: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "grab_release" }));
        return "Object released";
      },
      select: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "select_object" }));
        return "Object selected";
      },
      edit: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "edit_mode" }));
        return "Edit mode activated";
      },
      clap: (ws) => {
        ws.send(JSON.stringify({ type: "ui_command", command: "clap_action" }));
        return "Clap detected";
      },
    };
  }

  execute(action, ws) {
    const executor = this.actions[action];
    return executor ? executor(ws) : "Unknown action";
  }

  isValidAction(action) {
    return !!this.actions[action];
  }
}

module.exports = new SystemActions();
