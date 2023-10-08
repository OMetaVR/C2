document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll("#navbar a");

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add("active");
        }
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