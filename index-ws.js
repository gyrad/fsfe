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

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.clients.forEach((client) => {
    client.close();
  });
  shutdownDB();
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

// Begin WebSocket server
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const numClients = wss.clients.size;
  console.log(`Number of connected clients: ${numClients}`);

  wss.broadcast(`Current number of connected clients: ${numClients}`);

  db.run('INSERT INTO visitors (count, time) VALUES (?, ?)', [numClients, new Date().toISOString()], (err) => {
    if (err) {
      console.error('Error inserting data into database:', err.message);
    } else {
      console.log('Visitor count inserted into database.');
    }
  });

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
// End WebSocket server

// Begin DB
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
  )
    `);
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    if (err) {
      console.error('Error retrieving data:', err.message);
    } else {
      console.log(`Visitor count: ${row.count}, Time: ${row.time}`);
    }
  });
}

function shutdownDB() {
  getCounts();

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Closed the database connection.');
    }
  });
}
// End DB
