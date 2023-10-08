document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll("#navbar a");

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add("active");
        }
    });
});

document.getElementById('loadBotButton').addEventListener('click', function() {
    const host = document.getElementById('hostInput').value;
    const port = document.getElementById('portInput').value;
    const owner = document.getElementById('ownerInput').value;
    const botName = document.getElementById('botNameInput').value;

    fetch('/loadBot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            host: host,
            port: port,
            owner: owner,
            botName: botName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);  // Bot started successfully.
        console.log(`Received data - Host: ${data.host}, Port: ${data.port}, Owner: ${data.owner}, Bot Name: ${data.botName}`);
    });
});

let socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    setTimeout(() => {
        socket.connect();
    }, 5000); // try to reconnect every 5 seconds
});
