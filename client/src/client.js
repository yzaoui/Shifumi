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

    writeEvent(el)
};

const log = (text) => {
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
    input.value = '';

    sock.emit('message', text);
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

const usernameSet = () => {
    document.querySelector('#choose-nickname').remove();
};

log('Welcome to RPS');

const sock = io();
sock.on('message', writeMessage);
sock.on('server message', log);
sock.on('buttonsDisabled', buttonsDisabled);
sock.on('username set', usernameSet);

document.querySelector('#chat-form').addEventListener('submit', onChatSubmitted);
document.querySelector('#username-form').addEventListener('submit', onUsernameSubmitted);

addButtonListeners();
