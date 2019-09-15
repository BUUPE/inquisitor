import openSocket from 'socket.io-client';
const socket = openSocket(`${process.env.REACT_APP_ROOT_URL}:${process.env.REACT_APP_SOCKET_PORT}`);

const joinInterview = interviewId => {
  socket.emit('joinInterview', interviewId);
  socket.on('joinConfirmation', msg => console.log(msg));
  socket.on('joinNotification', msg => console.log(msg));
}

export { joinInterview };