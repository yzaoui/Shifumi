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
let users = [];

io.on('connection', (socket) => {
    console.log('Someone connected');

    socket.on('set username', (username) => {
        socket.join('in-game');
        socket.username = username;
        users.push(socket);
        socket.emit('username accepted', users.map(s => s.username));
        socket.broadcast.to('in-game').emit('user joined', username);

        socket.on('message', (text) => {
            if (text) {
                io.emit('message', socket.username, text);
            }
        });

        if (waitingPlayer) {
            waitingPlayer.emit('server message', 'Found an opponent!');
            new RpsGame(waitingPlayer, socket);

            waitingPlayer = null;
        } else {
            waitingPlayer = socket;
            waitingPlayer.emit('server message', 'Waiting for an opponent...');
        }
    });

    socket.on('disconnect', () => {
        console.log('Someone disconnected');
        if (users.includes(socket)) {
            io.to('in-game').emit('user left', socket.username);
            users.splice(users.indexOf(socket), 1);
        }
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(5927, () => {
    console.log('RPS started on 5927');
});
