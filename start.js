const app = express();
const os = require('os');
const path = require('path');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

app.use(express.json()); // IMPORTANT DO NOT DELETE AGAIN
app.use(express.urlencoded({ extended: true }));

app.post('/your-endpoint', (req, res) => {
    const { host, port, owner, botName } = req.body;
    console.log(host, port, owner, botName);
    res.json({ status: 'success' });
});

const server = http.createServer(app);
const io = socketIo(server);

let botsOnline = 0; 

io.on('connection', (socket) => {
    console.log('Client connected');
 

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/botCount', (req, res) => {
    res.json({ count: botsOnline });
});

// Serve static files from the public dir
app.use(express.static(path.join(__dirname, 'public')));

const args = process.argv.slice(2);
const config = {
    host: args.includes('--host') ? args[args.indexOf('--host') + 1] : 'localhost',
    port: args.includes('--port') ? parseInt(args[args.indexOf('--port') + 1]) : 25565,
    owner: args.includes('--owner') ? args[args.indexOf('--owner') + 1] : null
};

let botInstances = [];
const activeBots = [];
let masters = [];

app.post('/loadBot', (req, res) => {
    const { host, port, owner, botName } = req.body;
    console.log(host, port, owner, botName);

    io.emit('newBot', {
        botName: botName
    });

    if (!masters.includes(owner)) {
        masters.push(owner);
    }
    console.log('Current list of masters:', masters);

    activeBots.push({
        botName: botName,
        host: host,
        port: port,
        owner: owner,
        // if we need more fields they go here
    });

    const botModule = require(path.join(__dirname, './core/bot'));
    const bot = botModule(io, { host, port, owner, username: botName }, {
        onBotCreated: () => {
            botsOnline++;
            io.emit('botsOnlineUpdate', botsOnline);
        },
        onBotOffline: () => {
            botsOnline--;
            if(botsOnline < 0) botsOnline = 0;

            const botIndex = activeBots.findIndex(b => b.botName === botName);
            if (botIndex > -1) {
                activeBots.splice(botIndex, 1);
            }

            io.emit('botsOnlineUpdate', botsOnline);
        }
    });
    botInstances.push(bot);

    res.json({ message: 'Bot started successfully.', host, port, owner, botName });
});

app.get('/activeBots', (req, res) => {
    console.log("Server sending active bots:", activeBots);
    res.json(activeBots);
});

app.post('/stopBot', (req, res) => {
    const { botName } = req.body;

    const botInstanceIndex = botInstances.findIndex(bot => bot.instance && bot.instance.username === botName);

    if (botInstanceIndex === -1) {
        return res.status(404).json({ error: 'Bot not found.' });
    }

    botInstances[botInstanceIndex].stopBot();
    botInstances.splice(botInstanceIndex, 1); // remove the bot instance code
    res.json({ message: 'Bot stopped successfully.' });
});

io.on('connection', (socket) => {
    socket.on('stop_bot', (botName) => {
        const botInstanceIndex = botInstances.findIndex(bot => bot.instance && bot.instance.username === botName);
        if (botInstanceIndex !== -1) {
            botInstances[botInstanceIndex].stopBot();
            botInstances.splice(botInstanceIndex, 1); // remove the bot instance code
        }
    });
});

app.get('/masters', (req, res) => {
    console.log('Sending list of masters:', masters); // master list
    res.json(masters);
});

app.post('/addMaster', (req, res) => {
    const { master } = req.body;
    if (!masters.includes(master)) {
        masters.push(master);
    }
    console.log('Master added:', master);
    console.log('Current list of masters:', masters);
    res.json({ message: 'Master added successfully.' });
});

app.post('/removeMaster', (req, res) => {
    const { master } = req.body;
    const index = masters.indexOf(master);
    if (index > -1) {
        masters.splice(index, 1);
    }
    console.log('Master removed:', master);
    console.log('Current list of masters:', masters);
    res.json({ message: 'Master removed successfully.' });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

let chromeCommand;
switch(os.platform()) {
    case 'win32':
        chromeCommand = '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"';
        break;
    case 'darwin':
        chromeCommand = '"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"';
        break;
    case 'linux':
        chromeCommand = 'google-chrome';
        break;
    default:
        console.error('Unsupported platform');
        process.exit(1);
}

const url = 'http://localhost:3000';

exec(`${chromeCommand} --app=${url}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error opening Chrome: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
