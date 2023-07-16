const io = require('socket.io-client');
//const socket = io.connect('http://192.168.194.230:3000'); 
const socket = io.connect('http://localhost:3000'); 
const readline = require('readline');
const rclnodejs = require('rclnodejs');
const env = require('dotenv').config()

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// // Prompt the user to enter the password
// rl.question('Enter the password: ', (password) => {
//   // Emit the 'join' event with the password to join the room
//   rl.question('Enter your username: ', (name) => {
//     username = name;

 const password = process.env.RoomId
 const username = process.env.Team
 const myRole = process.env.Role
 
  socket.emit('join', { password });

  // Receive authentication result from server
  socket.on('authResult', (data) => {
    if (data.success) {
      console.log('Successfully joined the room.');
      console.log('you are', myRole);
      if (myRole !== 'player1' && myRole !== 'player2') 
        { console.log("\x1b[31mplease identify your role correctly\x1b[0m"); }

    } else {
      console.log('Failed to join the room. Wrong password.');
      socket.disconnect();
    }
  });

  // socket.on('playerRole', (data) => {
  //   myRole = data.player;
  //   console.log('you are', myRole);
  // });

rclnodejs.init().then(() => {
  const node = new rclnodejs.Node("client_node");//rclnodejs.createNode('client_node');
  publisher = node.createPublisher('std_msgs/msg/String', '/server_status');
  const subscriber = node.createSubscription(
    'std_msgs/msg/String',
    '/scoring_report',
    (message) => {
      console.log(`scoring report': ${message.data}`);
      // const scoringReport = `Scoring report: ${username}, Value: ${message.data}`;

      const scoringReport = {
        role : myRole,
        team : username,
        score : message.data,
        // myarray : [1,2,3,4,5],
      };
      socket.emit('scoringReport', scoringReport);
    }

  );
  rclnodejs.spin(node);
});

  // // Publish object status to server
// socket.emit('object_status', objectStatus);

// Receive command from server
  socket.on('command', (data) => {
    console.log('Received command:', data);
    if ((data.player === myRole || data.player === 'all') && data.command === 'start') {
      // if (publisher) {
      //   publisher.publish('start');
      //   console.log('Published message to ROS 2 topicss');
      // } else {
      //   console.log('ROS 2 publisher is not initialized');
      // }
      console.log('starting the controller')
      //call start game service
    } else if ((data.player === myRole || data.player === 'all') && data.command === 'spawn_object') {
      
      console.log('spawning the object')
      //call spawn object service
    }
    
  });

