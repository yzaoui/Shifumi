const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RpsGame = require('./rps-server');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

const port = 5927;

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;
let players = [];

io.on('connection', (socket) => {
    console.log(`Someone connected: ${socket.id}`);

    socket.on('set username', (username) => {
        socket.join('in-game');
        socket.username = username;
        players.push(socket);
        // Send list of current players to player since they've been accepted
        socket.emit('username accepted', players.map(s => s.username));
        socket.broadcast.to('in-game').emit('user joined', username);

        socket.on('user message', (text) => {
            if (text) {
                io.emit('user message', socket.username, text);
            }
        });

        if (waitingPlayer) {
            // If someone is waiting, match up with them
            waitingPlayer.emit('server message', 'Found an opponent!');
            new RpsGame(waitingPlayer, socket);

            // No longer anyone waiting
            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            waitingPlayer.emit('server message', 'Waiting for an opponent…');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Someone disconnected: ${socket.id}`);
        if (players.includes(socket)) {
            io.to('in-game').emit('user left', socket.username);
            players.splice(players.indexOf(socket), 1);
        }
        // If this player was waiting, remove them from waiting list
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(port, () => {
    console.log(`RPS started on ${port}`);
});
