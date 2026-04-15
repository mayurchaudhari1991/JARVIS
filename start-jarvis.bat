@echo off
chcp 65001 >nul
echo.
echo ╔════════════════════════════════════════════════╗
echo ║                                                ║
echo ║     J.A.R.V.I.S. Gesture Control System        ║
echo ║                                                ║
echo ║     Starting initialization sequence...          ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js detected
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [i] Installing root dependencies...
    call npm install
)

if not exist "server\node_modules" (
    echo [i] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo [i] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo [✓] All dependencies installed
echo.
echo ╔════════════════════════════════════════════════╗
echo ║                                                ║
echo ║     Checking Ollama...                         ║
echo ║                                                ║
echo ║     Make sure Ollama is running with:          ║
echo ║     ollama serve                               ║
echo ║                                                ║
echo ║     And Gemma 4B is pulled:                    ║
echo ║     ollama pull gemma:4b                       ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.

echo [i] Starting JARVIS...
echo.

REM Start both backend and frontend
call npm run dev

pause
