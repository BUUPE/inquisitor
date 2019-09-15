require('dotenv').config()

const express = require('express');
const socketIO = require('socket.io');
const path = require("path");


const serverPort = process.env.PORT || 3030;
const socketPort = process.env.REACT_APP_SOCKET_PORT;

const app = express();
app.use(express.static(path.join(__dirname, '../build')));
app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));
const server = app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));

const io = socketIO(server);

io.on('connection', (client) => {
  client.on('wave', msg => client.emit('waveback', msg));

  client.on('joinInterview', interviewId => {
    client.join(interviewId);
    client.emit('joinConfirmation', `you've joined room ${interviewId}`)
    io.to(interviewId).emit('joinNotification', `client: ${client.id} has joined room ${interviewId}`);
  });

});
//io.listen(socketPort);