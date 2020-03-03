require('dotenv').config()

const express = require('express');
const socketIO = require('socket.io');
const path = require("path");
const { Client } = require('pg');
const serverPort = process.env.PORT || 3030;
const app = express();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

app.use(express.static(path.join(__dirname, '../build')));

app.get('/api/dbtest', (req, res) => {
  client.connect();
  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, result) => {
    if (err) throw err;
    res.json(result);
    client.end();
  });
});

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));

const server = app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));

const io = socketIO(server);
io.on('connection', (client) => {
  client.on('joinInterview', interviewId => {
    client.join(interviewId);
    client.emit('joinConfirmation', `you've joined room ${interviewId}`)
    client.broadcast.to(interviewId).emit('joinNotification', `client: ${client.id} has joined room ${interviewId}`);
  });

  client.on('problemChange', ({ interviewId, problemKey }) =>
    client.broadcast.to(interviewId).emit('problemChange', problemKey));

  client.on('interviewClosed', interviewId =>
    client.broadcast.to(interviewId).emit('interviewClosed', true));
});
