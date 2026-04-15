# J.A.R.V.I.S. Gesture-Controlled AI Assistant

A gesture-controlled AI assistant powered by **Ollama (Gemma 4B)** with voice interaction capabilities. Built with React frontend and Node.js backend.

![JARVIS Interface](https://img.shields.io/badge/JARVIS-Online-00d4ff?style=for-the-badge)
![Ollama](https://img.shields.io/badge/Ollama-Gemma%204B-orange?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)

## Features

- **Gesture Control**: Control JARVIS using hand gestures via webcam
  - 👍 Thumbs Up - Confirm/Yes
  - 👎 Thumbs Down - Cancel/No
  - ✋ Open Palm - Stop/Halt
  - ✊ Fist - Activate/Start
  - ☝️ Point Up - Increase/Up
  - 👇 Point Down - Decrease/Down
  - ✌️ Victory - Take Screenshot
  - 👌 OK Sign - Execute Command
  - 🤙 Shaka - Relax Mode

- **Voice Interaction**: Speech recognition and text-to-speech responses
- **AI Chat**: Powered by Ollama with Gemma 4B running locally (offline capable)
- **Real-time Communication**: WebSocket for instant gesture/response handling
- **JARVIS Personality**: Professional, witty responses in the style of Iron Man's AI

## Prerequisites

1. **Node.js** (v16+) - [Download](https://nodejs.org/)
2. **Ollama** - [Download](https://ollama.com/)
3. **Webcam** for gesture recognition
4. **Microphone** for voice commands (optional)

## Quick Start

### 1. Install Ollama and Gemma 4B

```bash
# Install Ollama from https://ollama.com/

# Pull Gemma 4B model
ollama pull gemma:4b

# Start Ollama (should run on http://localhost:11434)
ollama serve
```

### 2. Install Dependencies

```bash
cd "f:\Personal Project\JARVIS"
npm run install-all
```

Or manually:
```bash
# Root dependencies
cd "f:\Personal Project\JARVIS"
npm install

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Start JARVIS

```bash
# Start both backend and frontend
cd "f:\Personal Project\JARVIS"
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- React frontend on `http://localhost:3000`

### 4. Access JARVIS

Open your browser and go to: `http://localhost:3000`

Allow camera access when prompted for gesture recognition.

## Project Structure

```
JARVIS/
├── server/                 # Node.js backend
│   ├── index.js           # Main server & WebSocket
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── GestureCamera.js     # Webcam & gesture detection
│   │   │   ├── JarvisInterface.js   # Chat interface
│   │   │   └── VoiceControl.js      # Speech recognition
│   │   ├── hooks/
│   │   │   └── useWebSocket.js      # WebSocket hook
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json           # Root package with scripts
└── README.md
```

## How It Works

### Gesture Recognition
- Uses **MediaPipe Hands** for real-time hand tracking
- Detects 10+ different hand gestures
- Sends recognized gestures to backend via WebSocket
- Backend queries Ollama for JARVIS-style response

### Voice System
- **Speech-to-Text**: Uses Web Speech API for voice commands
- **Text-to-Speech**: JARVIS responses are spoken aloud
- Auto-starts when system is online

### AI Backend
- Connects to local **Ollama** instance
- Uses **Gemma 4B** model for intelligent responses
- Maintains JARVIS personality (professional, witty, addresses user as "Sir/Ma'am")
- Fully offline capable once Ollama is running

## Configuration

### Environment Variables

Create `.env` files to customize:

**Server (optional)**
```env
PORT=5000
OLLAMA_URL=http://localhost:11434
```

### Customizing Gestures

Edit `server/index.js` to modify gesture commands:

```javascript
const GESTURE_COMMANDS = {
  'THUMBS_UP': { action: 'confirm', description: 'Confirm/Yes' },
  // Add your custom gestures here
};
```

### Changing AI Personality

Modify the `JARVIS_PERSONALITY` constant in `server/index.js`:

```javascript
const JARVIS_PERSONALITY = `You are JARVIS...`;
```

## Troubleshooting

### Camera not working
- Ensure browser has camera permissions
- Try refreshing the page
- Check if another app is using the camera

### Ollama connection failed
- Verify Ollama is running: `ollama serve`
- Check if Gemma 4B is pulled: `ollama list`
- Default URL is `http://localhost:11434`

### WebSocket connection issues
- Ensure port 5000 is not blocked
- Check if backend server is running
- Look for server logs in terminal

### Voice recognition not working
- Use Chrome/Edge for best Web Speech API support
- Ensure microphone permissions are granted
- Speak clearly and close to the microphone

## Tech Stack

- **Frontend**: React 18, MediaPipe Hands, Web Speech API
- **Backend**: Node.js, Express, WebSocket (ws), Axios
- **AI**: Ollama, Gemma 4B
- **Styling**: CSS3 with futuristic JARVIS-inspired design

## Browser Compatibility

- Chrome/Edge: Full support (recommended)
- Firefox: Voice features may vary
- Safari: Limited Web Speech API support

## License

MIT License - Feel free to modify and extend JARVIS!

## Contributing

This is a personal project, but suggestions and forks are welcome!

---

**"I am JARVIS, at your service, Sir."** 🤖
