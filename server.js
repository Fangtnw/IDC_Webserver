const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const roomId = uuidv4();

let password = 'myroom';
let connectedClients = 0;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A client is connected! ID: ' + socket.id);
  connectedClients++;
  if (connectedClients === 1){
    console.log('the referee is connected');
  } else if (connectedClients > 1){  
    console.log(`connected client : ${connectedClients}`);}

  let player = '';
  if (connectedClients === 2) {
    player = 'player1';
  } else if (connectedClients === 3) {
    player = 'player2';
  }
  
  // Notify the client about their assigned player role
  
  
  socket.on('command', (data) => {
    console.log('Published command:', data);
    io.emit('command', data);
  });
  
  socket.on('join', (data) => {
    if (data.password === password) {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined the room.`);
      socket.emit('authResult', { success: true }); // Send authentication success result to the client
      socket.emit('playerRole', { player });
    } else {
      console.log(`Client ${socket.id} entered the wrong password.`);
      socket.disconnect();
      socket.emit('authResult', { success: false }); // Send authentication failure result to the client
    }
  });

  socket.on('setPassword', (data) => {
    password = data.password; // Set the password received from the web
    console.log(`Password set to: ${password}`);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
    connectedClients--;
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
