const express = require('express');
const server = require('http').createServer();
const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

// Begin WebSocket server
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const numClients = wss.clients.size;
  console.log(`Number of connected clients: ${numClients}`);

  wss.broadcast(`Current number of connected clients: ${numClients}`);

  ws.on('message', (message) => {
    ws.readyState === ws.OPEN && ws.send(`Server received: ${message}`);
  });

  ws.on('close', () => {
    const numClients = wss.clients.size;
    console.log(`Client disconnected. Number of connected clients: ${numClients}`);
    wss.broadcast(`Current number of connected clients: ${numClients}`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};
