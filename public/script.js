const socket = io.connect('http://localhost:3000');

socket.on('bot_status', (message) => {
    updateDashboard(`[Status] ${message}`);
});

socket.on('bot_chat', (data) => {
    updateDashboard(`<${data.username}> ${data.message}`);
});

document.addEventListener("DOMContentLoaded", function() {
    fetch('/botCount')
    .then(response => response.json())
    .then(data => {
        document.getElementById('botsOnline').innerText = data.count;
        return fetch('/activeBots');
    })
    .then(response => response.json())
    .then(data => {
        console.log("Client received active bots:", data);
        data.forEach(botData => {
            createBotEntry(botData);
        });
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
});

socket.on('bot_health', (data) => {
    const healthBar = document.querySelector(`.botEntry[data-name="${data.botName}"] .healthBar`);
    if (healthBar) {
        healthBar.style.width = (data.health / 20) * 100 + '%';
    }
});

socket.on('bot_food', (data) => {
    const hungerBar = document.querySelector(`.botEntry[data-name="${data.botName}"] .hungerBar`);
    if (hungerBar) {
        hungerBar.style.width = (data.food / 20) * 100 + '%';
    }
});


socket.on('botCreated', () => {
    const botsOnlineElement = document.getElementById('botsOnline');
    const currentBots = parseInt(botsOnlineElement.innerText, 10);
    botsOnlineElement.innerText = currentBots + 1;
    console.log('Client received botCreated');
});

socket.on('botOffline', () => {
    const botsOnlineElement = document.getElementById('botsOnline');
    const currentBots = parseInt(botsOnlineElement.innerText, 10);
    botsOnlineElement.innerText = currentBots - 1;
    console.log('Client received botOffline');
});

socket.on('bot_health', (data) => {
    const healthBar = document.querySelector(`.botEntry[data-name="${data.botName}"] .healthBar`);
    if (healthBar) {
        healthBar.style.width = (data.health / 20) * 100 + '%';
    }
});

socket.on('bot_food', (data) => {
    const hungerBar = document.querySelector(`.botEntry[data-name="${data.botName}"] .hungerBar`);
    if (hungerBar) {
        hungerBar.style.width = (data.food / 20) * 100 + '%';
    }
});

function updateDashboard(message) {
    const dashboardElement = document.getElementById('botDashboard');
    dashboardElement.value += message + '\n';
    dashboardElement.scrollTop = dashboardElement.scrollHeight;
}

const commandInput = document.getElementById('commandInput');
commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && commandInput.value.trim() !== '') {
        // not set up to emit commands yet
        socket.emit('bot_command', commandInput.value.trim());


        commandInput.value = '';
    }
});

function createBotControlPanel(botName) {
    const controlPanel = document.createElement('div');
    controlPanel.id = 'botControlPanel';

    const botNameTitle = document.createElement('h2');
    botNameTitle.textContent = `Editing: ${botName}`;
    controlPanel.appendChild(botNameTitle);

    // Job selection
    const jobSelect = document.createElement('select');
    jobSelect.id = 'jobSelect';
    ['None', 'Miner', 'Guard', 'Crafter', 'Farmer', 'Breeder', 'Sorter'].forEach(job => {
        const option = document.createElement('option');
        option.value = job;
        option.text = job;
        jobSelect.appendChild(option);
    });
    controlPanel.appendChild(jobSelect);

    jobSelect.addEventListener('change', function() {
        // Remove existing job details if they exist
        const existingJobDetails = document.getElementById('jobDetails');
        if (existingJobDetails) {
            existingJobDetails.remove();
        }

        if (this.value !== 'None') {
            // Create new job details
            const jobDetails = document.createElement('div');
            jobDetails.id = 'jobDetails';
            jobDetails.textContent = `Details for job: ${this.value}`;
            controlPanel.appendChild(jobDetails);
        }
    });

// Toggles
const toggleContainer = document.createElement('div');
toggleContainer.style.display = 'flex';
toggleContainer.style.flexWrap = 'wrap';
toggleContainer.style.gap = '10px';
['Pick up items', 'Random farm area', 'Can sleep', 'Allow sprint', 'Can break blocks', 'Can place blocks', 'Auto eat'].forEach(mode => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = mode.replace(' ', '_');

    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = mode;

    toggleContainer.appendChild(checkbox);
    toggleContainer.appendChild(label);
});
controlPanel.appendChild(toggleContainer);

    // Coordinates
    const coordLabelContainer = document.createElement('div');
    const coordLabel = document.createElement('label');
    coordLabel.textContent = "Bed location:";
    coordLabelContainer.appendChild(coordLabel);
    controlPanel.appendChild(coordLabelContainer);
    
    const coordContainer = document.createElement('div');
    coordContainer.style.display = 'flex';
    coordContainer.style.gap = '10px';
    
    const bedLocationInputs = ['X', 'Y', 'Z'].map(coord => {
        const label = document.createElement('label');
        label.textContent = coord;
    
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `bed_location_${coord}`;
    
        const coordDiv = document.createElement('div');
        coordDiv.appendChild(label);
        coordDiv.appendChild(input);
        coordContainer.appendChild(coordDiv);
    
        return input;
    });
    
    controlPanel.appendChild(coordContainer);

// Food for auto-eat
const foodLabelContainer = document.createElement('div');
const foodLabel = document.createElement('label');
foodLabel.textContent = "Food for auto-eat:";
foodLabelContainer.appendChild(foodLabel);
controlPanel.appendChild(foodLabelContainer);

const foodContainer = document.createElement('div');
foodContainer.style.display = 'flex';
foodContainer.style.gap = '10px';
foodContainer.style.alignItems = 'center';

const foodInput = document.createElement('input');
foodInput.type = 'text';
foodInput.id = 'foodInput';
foodInput.placeholder = 'cooked steak, carrot, potato... etc.';
foodContainer.appendChild(foodInput);

const syncFoodBtn = document.createElement('button');
syncFoodBtn.id = 'syncFoodBtn';
syncFoodBtn.textContent = 'Sync Food List';
syncFoodBtn.style.padding = '5px 10px';
syncFoodBtn.style.whiteSpace = 'nowrap';
syncFoodBtn.addEventListener('click', () => {
    // Place sync coed here future faggot
});
foodContainer.appendChild(syncFoodBtn);

controlPanel.appendChild(foodContainer);

    // Stop bot button
    const stopBotBtn = document.createElement('button');
    stopBotBtn.id = 'stopBotBtn';
    stopBotBtn.textContent = 'Stop Bot';
    stopBotBtn.style.backgroundColor = '#f44336';
    stopBotBtn.style.color = 'white';
    stopBotBtn.style.border = 'none';
    stopBotBtn.style.padding = '10px 20px';
    stopBotBtn.style.borderRadius = '5px';
    stopBotBtn.style.cursor = 'pointer';
    stopBotBtn.style.fontSize = '16px';
    stopBotBtn.style.transition = 'background-color 0.3s';
    stopBotBtn.addEventListener('click', () => {
        socket.emit('stop_bot', botName);

        const botEntryToRemove = document.querySelector(`.botEntry[data-name="${botName}"]`);
        if (botEntryToRemove) {
            botEntryToRemove.remove();
        }
        controlPanel.remove();

        const botsOnline = document.getElementById('botsOnline');
        botsOnline.textContent = Number(botsOnline.textContent) - 1;
    });
    controlPanel.appendChild(stopBotBtn);

    return controlPanel;
}

function openBotDetails(botElement) {
    const botName = botElement.getAttribute('data-name'); 
    const container = document.getElementById('container');

    const existingPanel = document.getElementById('botControlPanel');
    if (existingPanel) existingPanel.remove();

    const controlPanel = createBotControlPanel(botName);
    container.appendChild(controlPanel);
}

socket.on('bot_stopped', (data) => {
    if (data.message) {
        alert(data.message);
        const existingPanel = document.getElementById('botControlPanel');
        if (existingPanel) existingPanel.remove();
    } else {
        alert('Failed to stop bot.');
    }
});

try {
    fetch('/activeBots')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Received active bots on client:", data);
        const botList = document.getElementById('botList');
        botList.innerHTML = '';  // Clear the current list
        data.forEach(bot => {
            const listItem = document.createElement('li');
            listItem.textContent = bot.botName;
            botList.appendChild(listItem);
        });
    });
} catch (error) {
    console.error("Error fetching active bots:", error);
}


document.addEventListener("mousemove", function(event) {
    const navbar = document.getElementById('navbar');
    if (event.clientY <= window.innerHeight * 0.15) {
        navbar.style.top = "0";
    } else {
        navbar.style.top = "-50px";
    }
});

socket.on('botsOnlineUpdate', (count) => {
    document.getElementById('botsOnline').textContent = count;
});

socket.on('newBot', (botData) => {
    const botList = document.getElementById('botList');
    const botEntry = document.createElement('div');
    botEntry.className = 'botEntry';
    botEntry.setAttribute('data-name', botData.botName);
    botEntry.onclick = function() {
        openBotDetails(this);
    };

    const botName = document.createElement('p');
    botName.textContent = botData.botName;
    botEntry.appendChild(botName);

    const healthBar = document.createElement('div');
    healthBar.className = 'healthBar';
    healthBar.style.width = (botData.health / 20) * 100 + '%';
    botEntry.appendChild(healthBar);

    const hungerBar = document.createElement('div');
    hungerBar.className = 'hungerBar';
    hungerBar.style.width = (botData.hunger / 20) * 100 + '%';
    botEntry.appendChild(hungerBar);

    botList.appendChild(botEntry);
});

function createBotEntry(botData) {
    const botList = document.getElementById('botList');
    const botEntry = document.createElement('div');
    botEntry.className = 'botEntry';
    botEntry.setAttribute('data-name', botData.botName);
    botEntry.onclick = function() {
        openBotDetails(this);
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.float = 'right';
    closeButton.onclick = function(event) {
        event.stopPropagation();
        location.reload();
    };

    botEntry.appendChild(closeButton);

    const botName = document.createElement('p');
    botName.textContent = botData.botName;
    botEntry.appendChild(botName);

    const healthBar = document.createElement('div');
    healthBar.className = 'healthBar';

    if (botData.health) {
        healthBar.style.width = (botData.health / 20) * 100 + '%';
    }
    botEntry.appendChild(healthBar);

    const hungerBar = document.createElement('div');
    hungerBar.className = 'hungerBar';

    if (botData.hunger) {
        hungerBar.style.width = (botData.hunger / 20) * 100 + '%';
    }
    botEntry.appendChild(hungerBar);

    botList.appendChild(botEntry);
}