const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const roomId = uuidv4();
const fs = require('fs');

let password = 'defaultpassword';
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A client is connected! ID: ' + socket.id);
  socket.on('command', (data) => {
    console.log('Published command:', data);
    io.emit('command', data);
  });
  
  socket.on('join', (data) => {
    if (data.password === password) {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined the room.`);
      socket.emit('authResult', { success: true }); // Send authentication success result to the client
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
  });
});

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});
