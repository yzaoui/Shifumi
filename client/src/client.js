const writeEvent = (element) => {
    const parent = document.querySelector('#events');

    let needToScroll = (parent.scrollTop + parent.clientHeight) === parent.scrollHeight;

    parent.appendChild(element);

    if (needToScroll) {
        parent.scrollTop = parent.scrollHeight;
    }
};

const writeMessage = (text) => {
    const el = document.createElement('li');
    el.innerHTML = text;
    writeEvent(el)
};

const log = (message) => {
    const el = document.createElement('li');
    el.innerHTML = message;

    const strong = document.createElement('strong');
    strong.appendChild(el);

    writeEvent(strong);
};

const onFormSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text);
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

log('Welcome to RPS');

const sock = io();
sock.on('message', writeMessage);
sock.on('server message', log);
sock.on('buttonsDisabled', buttonsDisabled);

document.querySelector('#chat-form').addEventListener('submit', onFormSubmitted);

addButtonListeners();
