const express = require('express');
const { reset } = require('nodemon');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');
//const path = require('path');
const roomId = uuidv4();

let password = 'myroom';
let connectedClients = 0;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A client is connected! ID: ' + socket.id);
  connectedClients++;
  console.log(`connected client : ${connectedClients}`);

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
    } else {
      console.log(`Client ${socket.id} entered the wrong password.`);
      socket.emit('authResult', { success: false });
      socket.disconnect();
       // Send authentication failure result to the client
    }
  });

  socket.on('setPassword', (data) => {
    password = data.password; // Set the password received from the web
    console.log(`Password set to: ${password}`);
  });

  socket.on('scoringReport', (scoringReport) => {
    let score = scoringReport;
    //scoringReport.score.isalpha() check alphabet
    if (scoringReport.status === 1)
    {
      io.emit('pass' ,scoringReport)
      io.emit('score', scoringReport);
    }
    else if (scoringReport.status === 2)
    {
      io.emit('timeout' ,scoringReport)
      io.emit('score', scoringReport);
    }
    else {
      io.emit('score', scoringReport);
    }
    console.log(`scoring report: ${JSON.stringify(score)}`);
  });

  socket.on('login', (loginReport) => {
    io.emit('login', loginReport);
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
    connectedClients--;
    const defaultboard = {
      role: 'reset',
    };
    io.emit('score', defaultboard);
    console.log(`connected client : ${connectedClients}`)
  });
});

http.listen(4000, () => {
  console.log('Server listening on port 4000');
});
