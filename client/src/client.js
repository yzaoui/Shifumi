const writeEvent = (text) => {
    // <ul> element
    const parent = document.querySelector('#events');

    // <li> element
    const el = document.createElement('li');
    el.innerHTML = text;

    parent.appendChild(el);
};

const onFormSubmitted = (e) => {
    e.preventDefault();

    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text);
};

writeEvent('Welcome to RPS');

const sock = io();
sock.on('message', writeEvent);

const onButtonClicked = (text) => {
    console.log(text);
    sock.emit('message', text);
};

document.querySelector('#chat-form').addEventListener('submit', onFormSubmitted);
document.querySelector('#rock').addEventListener('click', () => onButtonClicked("Rock"));
document.querySelector('#paper').addEventListener('click', () => onButtonClicked("Paper"));
document.querySelector('#scissors').addEventListener('click', () => onButtonClicked("Scissors"));
