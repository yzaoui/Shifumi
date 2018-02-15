const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RpsGame = require('./rps-server');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);


app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

io.on('connection', (sock) => {
    if (waitingPlayer) {
        waitingPlayer.emit('message', 'Found a partner!');
        new RpsGame(waitingPlayer, sock);

        waitingPlayer = null;
    } else {
        waitingPlayer = sock;
        waitingPlayer.emit('message', 'Waiting for a second partner...')
    }

    sock.on('message', (text) => {
        io.emit('message', text);
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(5927, () => {
    console.log('RPS started on 5927');
});
