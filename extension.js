const vscode = require('vscode');
const io = require('socket.io-client');

let socket;

function activate(context) {
  // Initial message to confirm activation
  vscode.window.showInformationMessage("Hello from the fesk");

  // Set up Socket.IO connection
  socket = io("https://remote-lu-ahmedaaerhman-da23b30a.koyeb.app", {
    transports: ['websocket'], // Force WebSocket only
    reconnectionAttempts: 3
  });

  // Handle connection event
  socket.on("connect", () => {
    console.log("✅ Connected to socket server");
  });

  // Handle connection error
  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err);
  });

  // Handle alert messages from the server
  socket.on("alert", (message) => {
    console.log("📨 Alert received:", message);
    if (message && message.text) {
      vscode.window.showInformationMessage(message.text);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("⚠️ Disconnected from server");
  });
}

function deactivate() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}

module.exports = {
  activate,
  deactivate
};