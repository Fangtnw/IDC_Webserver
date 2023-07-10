const io = require('socket.io-client');
const socket = io.connect('http://192.168.0.103:3000'); 
//const socket = io.connect('http://localhost:3000'); 
const readline = require('readline');
const rclnodejs = require('rclnodejs');

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
rclnodejs.init().then(() => {
  const node = rclnodejs.createNode('publisher_node');
  publisher = node.createPublisher('std_msgs/msg/String', '/server_status');
});

  // // Publish object status to server
// socket.emit('object_status', objectStatus);

// Receive command from server
  socket.on('command', (data) => {
    console.log('Received command:', data);
    if ((data.player === myRole || data.player === 'all') && data.command === 'start') {
      if (publisher) {
        publisher.publish('start');
        console.log('Published message to ROS 2 topicss');
      } else {
        console.log('ROS 2 publisher is not initialized');
      }
      console.log('starting the controller')
    } else if ((data.player === myRole || data.player === 'all') && data.command === 'spawn_object') {
      // Call ros2 service spawn_entity
      // ...
      // if (publisher) {
      //   publisher.publish('spawn');
      //   console.log('Published message to ROS 2 topic');
      // } else {
      //   console.log('ROS 2 publisher is not initialized');
      // }
      // console.log('spawning the object')
    }
  });

  rl.close();
});