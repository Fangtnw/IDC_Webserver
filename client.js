const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt the user to enter the password
rl.question('Enter the password: ', (password) => {
  // Emit the 'join' event with the password to join the room
  socket.emit('join', { password });

  // Receive authentication result from server
  socket.on('authResult', (data) => {
    if (data.success) {
      console.log('Successfully joined the room.');
    } else {
      console.log('Failed to join the room. Wrong password.');
      socket.disconnect();
    }
  });

  socket.on('playerRole', (data) => {
    myRole = data.player;
    console.log('you are', myRole);
  });

// ROS publish object state
// const objectStatus = [
//   [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1],
//   [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
// ];

// // Publish object status to server
// socket.emit('object_status', objectStatus);

// Receive command from server
  socket.on('command', (data) => {
    console.log('Received command:', data);
    if (data.player === myRole) {
      // Handle the command for player1
      // ...
    } else if (data.player === myRole) {
      // Handle the command for player2
      // ...
    }
  });

  rl.close();
});