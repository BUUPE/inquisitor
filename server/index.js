require('dotenv').config()

const express = require('express');
const socketIO = require('socket.io');
const path = require("path");
// const { Client } = require('pg');
const serverPort = process.env.PORT || 3030;
const app = express();
const db = require('./queries')

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });

app.use(express.static(path.join(__dirname, '../build')));

// app.get('/api/dbtest', (req, res) => {
//   client.connect();
//   client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, result) => {
//     if (err) throw err;
//     res.json(result);
//     client.end();
//   });
// });

//CRUD for user
app.get('/users', db.getUsers)
app.get('/users/:id', db.getUserById)
app.post('/users', db.createUser)
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)


//CRUD for question
app.get('/questions', db.getQuesions)
app.get('/questions/:id', db.getQuesiontById)
app.post('/questions', db.createQuestion)
app.put('/questions/:id'. db.updateQuestion)
app.delete('/questions/:id', dp.deleteQuestion)

//CRUD for event
app.get('/events'. db.getEvents)
app.get('/events/:id', db.getEventById)
app.post('/questions', db.createEvent)
app.put('/events/:id', db.updateEvent)
app.delete('/events/:id', db.deleteEvent)


//CRUD for interview
app.get('/interviews', db.getInterviews)
app.get('/interview/:id', db.getInterviewById)
app.post('/interviews', db.createInterview)
app.put('/interviews/:id', db.updateInterview)
app.delete('/interviews/:id', db.deleteInterview)

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../build/index.html')));






app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));



// const server = app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));

// const io = socketIO(server);
// io.on('connection', (client) => {
//   client.on('joinInterview', interviewId => {
//     client.join(interviewId);
//     client.emit('joinConfirmation', `you've joined room ${interviewId}`)
//     client.broadcast.to(interviewId).emit('joinNotification', `client: ${client.id} has joined room ${interviewId}`);
//   });

//   client.on('problemChange', ({ interviewId, problemKey }) =>
//     client.broadcast.to(interviewId).emit('problemChange', problemKey));

//   client.on('interviewClosed', interviewId =>
//     client.broadcast.to(interviewId).emit('interviewClosed', true));
// });
