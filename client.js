const io = require("socket.io-client");

const yaml = require("yaml");
const fs = require("fs");
const readline = require("readline");
const rclnodejs = require("rclnodejs");

const configPath = '/home/User/IDC/IDC_ws/src/IDC-Simulation/robot_description/config/properties.yaml';
const config = yaml.parse(fs.readFileSync(configPath, "utf8"));
const url = config.URL;
const socket = io.connect(url);

const password = config.RoomId;
const username = config.Team;
const myRole = config.Role;

// const env = require('dotenv').config()
//  const password = process.env.RoomId
//  const username = process.env.Team
//  const myRole = process.env.Role
console.log("Waiting for the server . . .");

socket.emit("join", { password });

// Receive authentication result from server
socket.on("authResult", (data) => {
  if (data.success) {
    console.log("Successfully joined the room.");
    console.log("Welcome", username);
    console.log("you are", myRole);
    if (myRole !== "player1" && myRole !== "player2") {
      console.log("\x1b[31mplease identify your role correctly\x1b[0m");
    }
  } else {
    console.log("Failed to join the room. Wrong password.");
    socket.disconnect();
  }
});

const loginReport = {
  role: myRole,
  team: username,
};

socket.emit("login", loginReport);

// socket.on('playerRole', (data) => {
//   myRole = data.player;
//   console.log('you are', myRole);
// });

rclnodejs.init().then(() => {
    const node = new rclnodejs.Node("client_node");
    const freeplay_client = node.createClient(
      "msg_interfaces/srv/FreePlay",
      "/free_play_command"
    );
    const start_client = node.createClient(
      "msg_interfaces/srv/Start",
      "/start_command"
    );
    const resetW_client = node.createClient(
      "msg_interfaces/srv/Reset",
      "/reset_command"
    );
    const spawn_client = node.createClient(
      "msg_interfaces/srv/SpawnObj",
      "/spawn_command"
    );

  const subscriber = node.createSubscription(
    "std_msgs/msg/Int16MultiArray",
    "/score_report",
    (message) => {
      console.log(`my score : ${message.data[0]} `);
      const scoringReport = {
        role: myRole,
        team: username,
        score: message.data[0], // score data or mission status
        status: message.data[1],
      };
      socket.emit("scoringReport", scoringReport);
    }
    // cont scoringReport = `Scoring report: ${username}, Value: ${message.data}`;
    //socket.emit('login', loginReport);
  );

  socket.on("command", (data) => {
    console.log("Received command:", data);
    if ((data.player === myRole || data.player === 'all') && data.command === 'start') {
      console.log('starting the controller');
      try {
        // call start game service
        // const start_request = { start_command: {} };
        start_client.sendRequest({ start_command: {} }, (response) => {
          console.log(`Result: ${typeof response}`, response);
        });
        console.log('game started');}
      catch (error) {
        console.error('Error while starting the game:', error);
      }
    }
    else if ((data.player === myRole || data.player === "all") && data.command === "freeplay"){
      console.log("starting freeplay");
      
      try {
          // call free play service
          const freeplay_request = { free_play_command: {} };
          freeplay_client.sendRequest(freeplay_request, (response) => {
            console.log(`Result: ${typeof response}`, response);
          });
          console.log("already set freeplay");
      } catch (error) {
        console.error("Error while starting freeplay:", error);
      }
    }
    else if ((data.player === myRole || data.player === 'all') && data.command === 'reset_world') {
      try {
        // call reset world service
        // const resetW_request = { reset_command: {} };
        resetW_client.sendRequest({ reset_command: {} }, (response) => {
          console.log(`Result: ${typeof response}`, response);
        });
        console.log('already reset the world');}
      catch (error) {
        console.error('Error while resetting the world:', error);
      }
    }
    else if ((data.player === myRole || data.player === 'all') && data.command === 'spawn_object') {
      console.log('spawning the object');
      try {
        // call spawn object service
        // const spawn_request = { spawn_command: {} };
        spawn_client.sendRequest({ spawn_command: {} }, (response) => {
          console.log(`Result: ${typeof response}`, response);
        });
        console.log('already sent object');}
      catch (error) {
        console.error('Error while spawning the object:', error);
      }
    }
  });
  // rclnodejs.spin(node)
  node.spin();
});

process.on("SIGINT", () => {
  console.log("   ok GOTCHA killing myself..");
  socket.disconnect();
  // rclnodejs.shutdown();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
