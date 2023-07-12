const io = require('socket.io-client');
const socket = io.connect('http://192.168.194.230:3000'); 
//const socket = io.connect('http://localhost:3000'); 
const readline = require('readline');
const rclnodejs = require('rclnodejs');

let username;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// Prompt the user to enter the password
rl.question('Enter the password: ', (password) => {
  // Emit the 'join' event with the password to join the room
  rl.question('Enter your username: ', (name) => {
    username = name;

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
  const node = rclnodejs.createNode('client_node');
  publisher = node.createPublisher('std_msgs/msg/String', '/server_status');
  const subscriber = node.createSubscription(
    'std_msgs/msg/String',
    'scoring_report',
    (message) => {
      // Send scoring report to the server
      console.log('kuy');
      console.log(`scoring report': ${message.data}`);
      const scoringReport = `Scoring report: ${username}, Value: ${message.data}`;
      socket.emit('scoringReport', scoringReport);
    }
  );
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
      
      console.log('spawning the object')
    }
  });

  rl.close();
});
});
