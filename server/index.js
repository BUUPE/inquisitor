const express = require('express');
const io = require('socket.io')();
const path = require("path");

const app = express();
const serverPort = 3030;
const socketPort = 8000;

app.use(express.static(path.join(__dirname, '../build')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));

app.listen(serverPort, () => console.log(`Server listening on localhost:${serverPort}!`));

io.on('connection', (client) => {
  // here you can start emitting events to the client 
});

io.listen(socketPort);