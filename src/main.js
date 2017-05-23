'use strict';

console.log("#################################");
console.log("# NeinChatBot Telegram Bot Server");
console.log("#################################\n");

const teleBot = require('telebot');
const fs = require('fs');

// load Telegram bot token from file and create bot
const token = fs.readFileSync('telegram_token.secret').toString().replace(/\r?\n|\r/, '');
console.log('------ Secret Token: [' + token + ']');
const bot = new teleBot(token);

const DBAccess = require('./db_access.js');

// Create and start cron job for new post messages.
const CronManager = require('./cron_manager.js');
CronManager.startJob('*/5 * * * *', function() { // run every 5 minutes.
  console.log('cron job: cron job triggered. (>o<)');

  DBAccess.getSubscribersChatIds(function(chatIds) {
    let checker = require('./post_checker.js');
    checker.checkForNewPosts(function(newPosts) {
      if (newPosts == null) {
        return console.log('cron job: checked for new posts, nothing found.');
      }
      for (var post of newPosts) {
        formatDateTime(post.created_at, function(time) {
          var text = `${ time }\nOP: ${ post.owner.username }\n\n${ post.title }`;
          console.log('cron job: sending message to subscribers with title: ' + post.title);
          for (var chatId of chatIds) {
            sendNewPostToChat(chatId, post.cover_photo, text);
          }
        });
      }
    });
  });
});

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

bot.on('/subscribe', msg => {
  let chatId = msg.chat.id;
  DBAccess.setSubscription(chatId);
  return bot.sendMessage(chatId, `You're now subscribed to updates on new posts in the Switzerland group.`);
});

bot.on('/unsubscribe', msg => {
  let chatId = msg.chat.id;
  DBAccess.removeSubscription(chatId);
  return bot.sendMessage(chatId, `Subscription cancelled.`);
});

/*
* React to any received message.
* If the message contains an url to a post, the op of the post is returned.
*/
bot.on('text', msg => {
  DBAccess.createUserIfNotExists(msg.chat.id, msg.from);
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

/*
* Convert the epoch (unix) timestamp to a readable format.
*/
function formatDateTime(epochTimeStamp, callback) {
  var d = new Date(epochTimeStamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = d.getFullYear();
  var month = months[d.getMonth()];
  var date = d.getDate();
  var hour = d.getHours();
  var min = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  var sec = (d.getSeconds() < 10 ? '0' : '') + d.getSeconds();
  var time = date + '. ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  callback(time);
}

/*
* Send a new post to a chat.
* @param chatId: Chat ID to send the message to.
* @param coverPhoto: Contains links to media attached to a post.
* @param text: The message text.
*/
function sendNewPostToChat(chatId, coverPhoto, text) {
  var photo;
  if (coverPhoto != null) {

    // check if post image is a gif.
    if (coverPhoto.thumbnails['480wa'] != null) {
      photo = coverPhoto.thumbnails['480wa'].url;
      // gif files have to be sent with the sendVideo() function.
      bot.sendVideo(chatId, photo, {caption: text});
    }
    else {
      // image is not a gif.
      photo = coverPhoto.thumbnails['840w'].url;
      bot.sendPhoto(chatId, photo, {caption: text});
    }
  } else {
    bot.sendMessage(chatId, text);
  }
}

// start the bot
bot.connect();
console.log('------ Bot is now running..');
