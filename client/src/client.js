const writeEvent = (element) => {
    const parent = document.querySelector('#events');

    let needToScroll = (parent.scrollTop + parent.clientHeight) === parent.scrollHeight;

    parent.appendChild(element);

    if (needToScroll) {
        parent.scrollTop = parent.scrollHeight;
    }
};

const writeMessage = (username, message) => {
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

const onChatSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    if (text) {
        input.value = '';

        sock.emit('message', text);
    }
};

const onUsernameSubmitted = (e) => {
    e.preventDefault();

    const username = document.querySelector('#username-input').value;

    sock.emit('set username', username);
};

const addButtonListeners = () => {
    ['rock', 'paper', 'scissors'].forEach((i) => {
        const button = document.getElementById(i);
        button.addEventListener('click', () => {
            sock.emit('play', i);
        })
    })
};

const buttonsDisabled = (disabled) => {
    ['rock', 'paper', 'scissors'].forEach((i) => {
        const button = document.getElementById(i);
        button.disabled = disabled;
    })
};

const pushUsername = (username) => {
    const parent = document.querySelector('#player-list-ul');
    const element = document.createElement('li');
    element.innerHTML = username;

    parent.appendChild(element);
};

const onUsernameAccepted = (usernames) => {
    document.querySelector('#choose-nickname').remove();
    document.querySelector('#chat').focus();
    usernames.forEach(pushUsername);
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

onServerMessage('Welcome to RPS');

const sock = io();
sock.on('message', writeMessage);
sock.on('server message', onServerMessage);
sock.on('buttonsDisabled', buttonsDisabled);
sock.on('username accepted', onUsernameAccepted);
sock.on('user joined', onUserJoined);
sock.on('user left', onUserLeft);

document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted);
document.querySelector('#username-form').addEventListener('submit', onUsernameSubmitted);

addButtonListeners();
