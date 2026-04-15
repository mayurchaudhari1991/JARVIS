const axios = require("axios");
const { OLLAMA_URL, JARVIS_PERSONALITY } = require("../config");

class OllamaService {
  constructor() {
    this.baseUrl = OLLAMA_URL;
  }

  async query(prompt, usePersonality = false) {
    try {
      const systemPrompt = usePersonality ? JARVIS_PERSONALITY : "";
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\nUser: ${prompt}\nJARVIS:`
        : prompt;

      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
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

  async chat(message) {
    return this.query(message, true);
  }

  async acknowledgeGesture(gesture, description) {
    const prompt = `The user performed the "${gesture}" gesture (${description}). Acknowledge this action briefly as JARVIS would.`;
    return this.query(prompt, true);
  }

  async acknowledgeVoice(text) {
    const prompt = `User said: "${text}". Respond as JARVIS would.`;
    return this.query(prompt, true);
  }
}

module.exports = new OllamaService();
