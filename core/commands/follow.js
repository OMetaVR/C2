//Main library
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

class Follow{
    constructor(bot, username){
        this.bot = bot;
        this.username = username;
        this.followInterval = null;
        bot.loadPlugin(pathfinder);
    }

    followPlayer(username){
        const player = bot.players[username];

        if(!player){
            //Send player not found error on console
            return;
        }

        bot.pathfinder.setMovements(new Movements(bot, player));
        bot.pathfinder.setGoal(new goals.GoalNear(player.position.x, player.position.y, player.position.z, 1));

        this.followInterval = setInterval(() => {
            if(!player.entity){
                //Same as above
                StopFollow(bot);
                return;
            }
            bot.pathfinder.setMovements(new Movements(bot, player));
            bot.pathfinder.setGoal(new goals.GoalNear(player.position.x, player.position.y, player.position.z, 1));
        }, 500);
        
    }
}

class StopFollow{
    constructor(bot){
        this.bot = bot;
    }

    stopFollowing(){
        //Send some stop logs too, maybe add a dev option to send ALL posible logs, just for info.
        clearInterval(this.followInterval);
        bot.pathfinder.setGoal(null);
    }
}