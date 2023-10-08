document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll("#navbar a");

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add("active");
        }
    });

    fetch('/masters')
        .then(response => response.json())
        .then(data => {
            console.log('Received list of masters:', data);
            const nameList = document.getElementById('nameList');
            data.forEach(master => {
                const nameDiv = document.createElement('div');
                nameDiv.textContent = master;
                nameDiv.classList.add('nameItem');
                nameList.appendChild(nameDiv);
            });
        });
});

document.getElementById('addNameBtn').addEventListener('click', function() {
    const nameValue = document.getElementById('masterNameInput').value;
    if (nameValue) {
        fetch('/addMaster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ master: nameValue })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);  // Master added successfully.
        });
        const nameDiv = document.createElement('div');
        nameDiv.textContent = nameValue;
        nameDiv.classList.add('nameItem');
        document.getElementById('nameList').appendChild(nameDiv);
        document.getElementById('masterNameInput').value = '';  // Clear the input
    }
});

document.getElementById('nameList').addEventListener('click', function(e) {
    if (e.target.classList.contains('nameItem')) {
        e.target.classList.toggle('selected');
    }
});

document.getElementById('removeNameBtn').addEventListener('click', function() {
    console.log("Remove button clicked!"); // Just to confirm this function is entered

    const selectedNames = document.querySelectorAll('.nameItem.selected');
    console.log("Number of selected names:", selectedNames.length); // How many names are selected

    selectedNames.forEach(name => {
        console.log("Removing:", name.textContent); // Which name is being removed

        fetch('/removeMaster', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ master: name.textContent })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);  // Master removed successfully.
        });

        name.remove();
    });
});


document.addEventListener('DOMContentLoaded', function() {

    const masterNameInput = document.getElementById('masterNameInput');
    const nameList = document.getElementById('nameList');
    const addNameBtn = document.getElementById('addNameBtn');
    const removeNameBtn = document.getElementById('removeNameBtn');

    addNameBtn.addEventListener('click', addName);
    masterNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const nameValue = document.getElementById('masterNameInput').value;
            if (nameValue) {
                fetch('/addMaster', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ master: nameValue })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);  // Master added successfully.
                });
                const nameDiv = document.createElement('div');
                nameDiv.textContent = nameValue;
                nameDiv.classList.add('nameItem');
                document.getElementById('nameList').appendChild(nameDiv);
                document.getElementById('masterNameInput').value = '';  // Clear the input
            }
        }
    });
    nameList.addEventListener('click', function(e) {
        if (e.target.classList.contains('nameItem')) {
            e.target.classList.toggle('selected');
        }
    });

    removeNameBtn.addEventListener('click', function() {
        const selectedNames = document.querySelectorAll('.nameItem.selected');
        selectedNames.forEach(name => name.remove());
    });

    function addName() {
        const nameValue = masterNameInput.value;
        if (nameValue) {
            const nameDiv = document.createElement('div');
            nameDiv.textContent = nameValue;
            nameDiv.classList.add('nameItem');
            nameList.appendChild(nameDiv);
            masterNameInput.value = '';  // Clear the input
        }
    }
});

document.getElementById('nameList').addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('nameItem')) {
        e.target.classList.toggle('selected');
    }
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