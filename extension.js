const vscode = require('vscode');
const io = require('socket.io-client');

let socket;

function activate(context) {
  // Initial message to confirm activation
  vscode.window.showInformationMessage("Hello from the fesk");

  // Set up Socket.IO connection
  socket = io("https://grim-shirline-ahmedaaerhman-e8a9933e.koyeb.app", {
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
  //-----------------------------------------------
  // let sendMessageCommand = vscode.commands.registerCommand('extension.sendMessage', () => {
  //   const inputBox = vscode.window.showInputBox({
  //     prompt: 'Enter a message to send to the server'
  //   });

  //   inputBox.then(messageText => {
  //     if (messageText) {
  //       // Send the message to the server
  //       socket.emit('sendMessage', { text: messageText });
  //       vscode.window.showInformationMessage(`Message sent: ${messageText}`);
  //     }
  //   });
  // });

  // // Add the command to the context
  // context.subscriptions.push(sendMessageCommand);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("chatView", new ChatViewProvider(context.extensionUri))
  );

}

function deactivate() {
  if (socket && socket.connected) {
    socket.disconnect();
  }
}
class ChatViewProvider {
  constructor(extensionUri) {
    this.extensionUri = extensionUri;
  }

  resolveWebviewView(webviewView) {
    const webview = webviewView.webview;
    webview.options = { enableScripts: true };

    webview.html = getWebviewContent();

    webview.onDidReceiveMessage(msg => {
      if (msg.type === 'send' && msg.text.trim()) {
        socket.emit('sendMessage', { text: msg.text });
      }
    });
  }
}

function getWebviewContent() {
  return `

  <html>
  <head>
    <style>
      body {
        background-color: rgba(0, 0, 0, 0); /* Transparent background */
        padding: 10px;
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box; /* Ensure padding is part of the element's width/height */
      }

      .container {
        text-align: center;
        width: 95%;
        margin: 0 auto;
        box-sizing: border-box; /* Make sure padding is included in the width */
      }

      textarea {
        width: 100%;
        box-sizing: border-box;
        resize: none;
        padding: 10px; /* padding inside the textarea */
        font-size: 14px;
        line-height: 1.4;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 6px;
        height: 60px; /* Fixed height similar to GitHub's input field */
        margin-bottom: 10px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      }

      button {
        width: 100%;
        margin-top: 10px;
        padding: 12px;
        background: rgba(0, 122, 255, 0.8);
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 15px;
      }

      button:hover {
        background: rgba(0, 122, 255, 1);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p >Enter your message </p>
      <textarea id="messageBox" placeholder="Type a message..." rows="3"></textarea>
      <button id="sendBtn">Send</button>
    </div>

    <script>
      const vscode = acquireVsCodeApi();
      document.getElementById('sendBtn').onclick = () => {
        const text = document.getElementById('messageBox').value;
        vscode.postMessage({ type: 'send', text });
        document.getElementById('messageBox').value = '';
      };
      document.getElementById('messageBox').addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          document.getElementById('sendBtn').click();
        }
      });
    </script>
  </body>
</html>

`;

}

module.exports = {
  activate,
  deactivate
};