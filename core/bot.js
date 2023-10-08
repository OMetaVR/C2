const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

module.exports = (io, config, callbacks) => {
    const botOptions = {
        host: config.host,
        port: config.port,
        username: config.username || 'botUsername',
        // future me, add other shit here when needed
    };

    const bot = mineflayer.createBot(botOptions);
    bot.commands = new Map();  // Command collection
    
    let botInitialized = false;

    bot.on('login', () => {
        if (!botInitialized) {
            botInitialized = true;
            callbacks.onBotCreated();
        }
    });

    const commandsDir = path.join(__dirname, 'commands');
    function loadCommands() {
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsDir, file));
            bot.commands.set(command.name, command);
        }
    }

    loadCommands();

    bot.on('chat', (username, message) => {
        console.log(`<${username}> ${message}`);
        io.emit('bot_chat', { username, message });

        if (config.owner && username === config.owner) {
            const args = message.trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = bot.commands.get(commandName);

            if (command) {
                try {
                    command.execute(bot, message, args);
                } catch (error) {
                    console.error(error);
                    bot.chat('There was an error executing that command!');
                }
            }
        }
    });

    bot.on('health', () => {
        io.emit('bot_health', {
            botName: config.username,  
            health: bot.health
        });
    });
    
    let prevFoodLevel = bot.food;
    bot.on('physicTick', () => {
        if (bot.food !== prevFoodLevel) {
            io.emit('bot_food', {
                botName: bot.username,
                food: bot.food
            });
            prevFoodLevel = bot.food;
        }
    });

    bot.on('error', (err) => {
        console.error("Bot encountered an error:", err);
        callbacks.onBotOffline();
    });

    bot.on('kicked', (reason, loggedIn) => {
        console.error("Bot was kicked:", reason, loggedIn);
        callbacks.onBotOffline();
    });

    bot.on('end', () => {
        console.log("Bot has disconnected.");
        io.emit('bot_status', 'Bot has disconnected.');
        callbacks.onBotOffline();
    });

    return {
        instance: bot,
        stopBot: () => {
            bot.end('Stopped by user.');
        }
    };
};
