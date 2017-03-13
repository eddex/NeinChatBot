'use strict';

console.log("###############################");
console.log("NeinChatBot Telegram Bot Server");
console.log("###############################\n");

const teleBot = require('TeleBot');
const fs = require('fs');

// load Telegram bot token from file and create bot
var token = fs.readFileSync('telegram_token.secret').toString().replace(/\n$/, '');
console.log('------ Secret Token: [' + token + "]");
const bot = new teleBot(token);

/*
* Handles the /start command.
* Sends the user a welcome message.
*/
bot.on('/start', msg => {
  let chatId = msg.chat.id;
  let firstName = msg.from.first_name;
  let text = msg.text;
  return bot.sendMessage(chatId, `Welcome, ${ firstName }!\nUse /help to see what this bot is all about.`);
});

/*
* Handles the /help command.
* Sends the user a helpful help message.
*/
bot.on('/help', msg => {
  let chatId = msg.chat.id;
  let text = msg.text;
  return bot.sendMessage(chatId, `Rule 1: No baguettes.\nRule2: Refer to rule 1.`);
});

bot.on('/debug', msg => {
  let checker = require('./post_checker.js');
  let chatId = msg.chat.id;
  var text = '';
  var src = '';
  checker.checkForNewPost(function(data) {
    text = data.text;
    src = data.src;

    console.log('/debug, text=' + text + 'src=' + src);
    return bot.sendMessage(chatId, `test: ${ text }`);
  });
});



// start the bot
bot.connect();
console.log('------ Bot is now running..');
