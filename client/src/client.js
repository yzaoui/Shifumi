const writeEvent = (text) => {
    // <ul> element
    const parent = document.querySelector('#events');

    // <li> element
    const el = document.createElement('li');
    el.innerHTML = text;

    let needToScroll = (parent.scrollTop + parent.clientHeight) === parent.scrollHeight;

    parent.appendChild(el);

    if (needToScroll) {
        parent.scrollTop = parent.scrollHeight;
    }
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
            sock.emit('play', i)
        })
    })
};

writeEvent('Welcome to RPS');

const sock = io();
sock.on('message', writeEvent);

document.querySelector('#chat-form').addEventListener('submit', onFormSubmitted);

addButtonListeners();
