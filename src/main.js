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
  // TODO: create user profile in DB.
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

bot.on('/user', msg => {
  let dbAccess = require('./db_access.js');

  dbAccess.createUser(msg.chat.id, msg.from);
});

bot.on('/debug', msg => {
  let checker = require('./post_checker.js');
  let chatId = msg.chat.id;

  checker.checkForNewPosts(function(newPosts) {
    if (newPosts == null) {
      return bot.sendMessage(chatId, 'nothing new to see.');
    }

    for (var post of newPosts) {
      console.log('sending message with title: ' + post.title);

      var a = new Date(post.created_at * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = (a.getMinutes()<10?'0':'') + a.getMinutes();
      var sec = (a.getSeconds()<10?'0':'') + a.getSeconds();
      var time = date + '. ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

      var text = `New Post (${ time }):\n${ post.title }\n\nOP: ${ post.owner.username }`;

      var photo;
      if (post.cover_photo != null) {

        // check if post image is a gif.
        if (post.cover_photo.thumbnails['480wa'] != null) {
          photo = post.cover_photo.thumbnails['480wa'].url
          // gif files have to be sent with the sendVideo() function.
          bot.sendVideo(chatId, photo, {caption: text});
        }
        else {
          // image is not a gif.
          photo = post.cover_photo.thumbnails['840w'].url;
          bot.sendPhoto(chatId, photo, {caption: text});
        }
      } else {
        bot.sendMessage(chatId, text);
      }
    }
  });
});

// start the bot
bot.connect();
console.log('------ Bot is now running..');
