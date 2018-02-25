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

io.on('connection', (socket) => {
    console.log('Someone connected');

    socket.on('set username', (username) => {
        socket.username = username;
        socket.emit('username set');
        io.emit('server message', `${username} has joined the room`);

        socket.on('message', (text) => {
            io.emit('message', socket.username, text);
        });

        if (waitingPlayer) {
            waitingPlayer.emit('server message', 'Found an opponent!');
            new RpsGame(waitingPlayer, socket);

            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            waitingPlayer.emit('server message', 'Waiting for an opponent...')
        }
    });

    socket.on('disconnect', () => {
        io.emit('server message', `${socket.username} has left the room`);
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(5927, () => {
    console.log('RPS started on 5927');
});
