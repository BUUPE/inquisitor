import openSocket from 'socket.io-client';
const socket = openSocket();

const joinInterview = interviewId => {
  socket.emit('joinInterview', interviewId);
  socket.on('joinConfirmation', msg => console.log(msg));
  socket.on('joinNotification', msg => console.log(msg));
}

export { joinInterview };