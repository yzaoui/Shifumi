const writeEvent = (element) => {
    const parent = document.querySelector('#events');

    let needToScroll = (parent.scrollTop + parent.clientHeight) === parent.scrollHeight;

    parent.appendChild(element);

    if (needToScroll) {
        parent.scrollTop = parent.scrollHeight;
    }
};

const socket = io();

document.querySelector("#username-input").focus();

/********************************************************************************
 *                         Event listeners start here                           *
 ********************************************************************************/

const playButtonsEnabled = (enabled) => {
    ['rock', 'paper', 'scissors'].forEach((i) => {
        const button = document.getElementById(i);
        button.disabled = !enabled;
    });
};

const addButtonListeners = () => {
    ['rock', 'paper', 'scissors'].forEach((i) => {
        const button = document.getElementById(i);
        button.addEventListener('click', () => {
            socket.emit('play', i);
        });
    });
};

addButtonListeners();

const onChatSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    // Move focus back to input to immediately be ready to type again
    input.focus();
    const text = input.value.trim();
    if (text) {
        input.value = '';

        socket.emit('user message', text);
    }
};

const onUsernameSubmitted = (e) => {
    e.preventDefault();

    const username = document.querySelector('#username-input').value.trim();

    if (username) {
        socket.emit('set username', username);
    } else {
        // Let user try another username
        document.querySelector('#username-input').focus();
    }
};

document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted);
document.querySelector('#username-form').addEventListener('submit', onUsernameSubmitted);

/********************************************************************************
 *                        Server listeners start here                           *
 ********************************************************************************/

const onUserMessage = (username, message) => {
    const strong = document.createElement('strong');
    strong.innerHTML = `${username}: `;

    const messageNode = document.createTextNode(message);

    const el = document.createElement('li');
    el.appendChild(strong);
    el.appendChild(messageNode);

    writeEvent(el);
};

const onServerMessage = (text) => {
    const el = document.createElement('li');
    el.innerHTML = text;

    const strong = document.createElement('strong');
    strong.appendChild(el);

    writeEvent(strong);
};

const onGameStart = () => {
    playButtonsEnabled(true);
};

const pushUsername = (username) => {
    const parent = document.querySelector('#player-list-ul');
    const element = document.createElement('li');
    element.innerHTML = username;

    parent.appendChild(element);
};

const onUsernameAccepted = (usernames) => {
    // Remove the username form
    document.querySelector('#choose-username').remove();
    // Remove .dim-overlay from darkened elements
    document.querySelectorAll('.dim-overlay').forEach(e => e.classList.remove('dim-overlay'));
    // Focus on chat input box
    document.querySelector('#chat').focus();
    // Show list of users
    usernames.forEach(pushUsername);
};

const onPlayAccepted = () => {
    playButtonsEnabled(false);
};

const onUserJoined = (username) => {
    onServerMessage(`${username} has joined the room.`);
    pushUsername(username);
};

const onUserLeft = (username) => {
    onServerMessage(`${username} has left the room.`);
    const usernames = document.querySelectorAll('#player-list-ul li');
    for (let i = 0; i < usernames.length; i++) {
        let li = usernames[i];
        if (li.innerHTML === username) {
            li.parentNode.removeChild(li);
            break;
        }
    }
};

const onDisconnect = (reason) => {
    onServerMessage(reason);
};

onServerMessage('Welcome to RPS');

socket.on('user message', onUserMessage);
socket.on('server message', onServerMessage);
socket.on('game start', onGameStart);
socket.on('username accepted', onUsernameAccepted);
socket.on('play accepted', onPlayAccepted);
socket.on('user joined', onUserJoined);
socket.on('user left', onUserLeft);
socket.on('disconnect', onDisconnect);
