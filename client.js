const io = require('socket.io-client');
//const socket = io.connect('http://192.168.194.1:4000'); 
const socket = io.connect('http://localhost:4000'); 
//const socket = io.connect('https://db76-125-25-108-5.ngrok-free.app'); 

const readline = require('readline');
const rclnodejs = require('rclnodejs');

const yaml = require('yaml');
const fs = require('fs');

const configPath = './public/player.yaml';
const config = yaml.parse(fs.readFileSync(configPath, 'utf8'));

const password = config.RoomId;
const username = config.Team;
const myRole = config.Role;

// const env = require('dotenv').config()
//  const password = process.env.RoomId
//  const username = process.env.Team
//  const myRole = process.env.Role
console.log('Waiting for the server . . .')

socket.emit('join', { password });

  // Receive authentication result from server
socket.on('authResult', (data) => {
  if (data.success) {
    console.log('Successfully joined the room.');
    console.log('Welcome', username); console.log('you are', myRole);
    if (myRole !== 'player1' && myRole !== 'player2') 
      { console.log("\x1b[31mplease identify your role correctly\x1b[0m"); }

    } else {
      console.log('Failed to join the room. Wrong password.');
      socket.disconnect();
    }
  });
  
const loginReport = {
  role : myRole,
  team : username,}

socket.emit('login', loginReport);

  // socket.on('playerRole', (data) => {
  //   myRole = data.player;
  //   console.log('you are', myRole);
  // });

rclnodejs.init().then(() => {
node = new rclnodejs.Node("client_node");
publisher = node.createPublisher('std_msgs/msg/String', '/server_status');
const spawn_client = node.createClient('msg_interfaces/srv/SpawnObj','/spawn_command');
//const resetW_client = node.createClient('msg_interfaces/srv/SpawnObj','/spawn_command');
//const freeplay_client = node.createClient('msg_interfaces/srv/SpawnObj','/spawn_command');
//const start_client = node.createClient('msg_interfaces/srv/SpawnObj','/spawn_command');

const subscriber = node.createSubscription(
  'std_msgs/msg/Int16MultiArray',
  '/score_report',
  (message) => {
    if (message.data[1] === 0 || message.data[1] === 1)
    {console.log(`my score : ${message.data[0]} `);
      const scoringReport = {
      role : myRole,
      team : username,
      score : message.data[0], // score data or mission status
      status : message.data[1],
      }
     socket.emit('scoringReport', scoringReport);
    }
    // cont scoringReport = `Scoring report: ${username}, Value: ${message.data}`;
    //socket.emit('login', loginReport);
    }
  );

socket.on('command', (data) => {
  console.log('Received command:', data);
    if ((data.player === myRole || data.player === 'all') && data.command === 'start') {
      console.log('starting the controller')
      //call start game service
      // const start_request = {spawn_command: {}}
      start_client.sendRequest(start_request, (response) => {
        console.log(`Result: ${typeof response}`, response);
      });
      console.log('game started')
    } 
    else if ((data.player === myRole || data.player === 'all') && data.command === 'freeplay'){
      //call free play service
      // const freeplay_request = {spawn_command: {}}
      freeplay_client.sendRequest(freeplay_request, (response) => {
        console.log(`Result: ${typeof response}`, response);
      });
      console.log('already set free play')
    }
    else if ((data.player === myRole || data.player === 'all') && data.command === 'reset_world'){
      //call reset world service
      // const resetW_request = {spawn_command: {}}
      resetW_client.sendRequest(resetW_request, (response) => {
        console.log(`Result: ${typeof response}`, response);
      });
      console.log('already reset the world')
    }
  
    else if ((data.player === myRole || data.player === 'all') && data.command === 'spawn_object') {
      console.log('spawning the object')
      const spawn_request = {spawn_command: {}}
      spawn_client.sendRequest(spawn_request, (response) => {
        console.log(`Result: ${typeof response}`, response);
      });
      console.log('already sent object')
    }
  });

  rclnodejs.spin(node);
});

process.on('SIGINT', () => {
  console.log("   ok GOTCHA killing myself..");
  socket.disconnect();
  rclnodejs.shutdown();
  process.exit(0);
});


  
