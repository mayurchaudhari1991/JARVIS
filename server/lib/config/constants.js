// JARVIS Configuration Constants

const PORT = process.env.PORT || 5000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

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
  CREATE_OBJECT: { action: "create", description: "Create Object" },
  DELETE_ALL: { action: "delete_all", description: "Delete All Objects" },
  GRAB_START: { action: "grab", description: "Grab Object" },
  GRAB_MOVE: { action: "grab_move", description: "Move Object" },
  GRAB_RELEASE: { action: "release", description: "Release Object" },
  SELECT_OBJECT: { action: "select", description: "Select Object" },
  EDIT_MODE: { action: "edit", description: "Edit Object" },
  CLAP: { action: "clap", description: "Clap Gesture" },
};

module.exports = {
  PORT,
  OLLAMA_URL,
  JARVIS_PERSONALITY,
  GESTURE_COMMANDS,
};
