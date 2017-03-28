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

/*
* React to any received message.
* url: If a url to a post is received, the op of the post is returned.
*/
bot.on('text', msg => {
  if (!msg.text.startsWith("http://getcookie.com/p/")) {
    if (!msg.text.startsWith('/debug')) {
      console.log("received unsupported text: " + msg.text);
    }
    return;
  }
  let checker = require('./post_checker.js');
  let chatId = msg.chat.id;
  console.log('text=' + msg.text);
  checker.getOp(msg.text, function(op) {
    console.log('op=' + op);
    return bot.sendMessage(chatId, `OP is: ${ op }`);
  });
});

bot.on('/debug', msg => {
  let checker = require('./post_checker.js');
  let chatId = msg.chat.id;

  checker.checkForNewPosts(function(newPosts) {
    if (newPosts == null) {
      return;
    }
    // TODO: create messages with images for each new post. Gifs?
    for (var post of newPosts) {
      console.log('sending message with title: ' + post.title);
      bot.sendMessage(chatId, `[New Post]:\n ${ post.title }`);
    }
  });
});

// start the bot
bot.connect();
console.log('------ Bot is now running..');
