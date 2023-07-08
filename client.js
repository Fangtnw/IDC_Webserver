const socket = io();

// Example object status from player to server
const objectStatus = [
  [0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0],
];

// Publish object status to server
socket.emit('object_status', objectStatus);

// Receive command from server
socket.on('command', (data) => {
  console.log('Received command:', data);
  // Check if it is the player's command
  if (data.player === 'player1') {
    // Handle the command for player1
    // ...
  } else if (data.player === 'player2') {
    // Handle the command for player2
    // ...
  }
});

// Receive object status from server
socket.on('object_status', (data) => {
  console.log('Received object status:', data);
  // Handle the object status
  // ...
});
