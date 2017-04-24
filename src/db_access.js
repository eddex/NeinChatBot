'use strict';

const Datastore = require('nedb');
const DB = new Datastore({filename: 'data/users.db'});

DB.loadDatabase(function(err) {
  if (err) {
    console.error("db_access: Cannot load users database!");
  }
  else {
    console.log("db_access: User database loaded successfully.");
  }
});

var db_access = {

  /*
   * Create a new user in the DB if there is no entry with the same chat ID.
   */
  createUserIfNotExists: function(chatId, user) {
    console.log('trying to create new user...');
    var user = {
      _id: chatId,
      userId: user.id,
      userName: user.username ? user.username : ' ',
      firstName: user.first_name ? user.first_name : ' ',
      lastName: user.last_name ? user.last_name : ' ',
      subscription: 0
    };
    DB.insert(user, function(err) {
      if (err) {
        console.error("db_access: error while creating new user with chat ID " + user._id + ", user might already exist in DB..");
      }
      else {
        console.info("db_access: user [" + user._id + "] successfully created.");
      }
    });
  },

  /*
  * Get all chat IDs that have subscribed to updates of the Switzerland group.
  */
  getSubscribersChatIds: function(callback) {
    var chatIds = [];
    DB.find({ subscription: 1 },{},function(err, docs) {
      docs.forEach(function(user) {
        console.log('subscribed chat: ' + user._id);
        chatIds.push(user._id);
      });
      callback(chatIds);
    });
  },

  /*
  * Change subscription for document with _id: chatId to 1.
  * @param chatId: The chat id of the document to update.
  */
  setSubscription: function(chatId, callback) {
    DB.update({ _id:chatId }, { $set: { subscription: 1 } }, {}, function(err, numReplaced) {
      if (err) {
        console.error("Failed to set subscription for user [" + chatId + "]");
      }
      else {
        console.info("Successfully set subscription for user [" + chatId + "]");

        // Clean up DB file. Remove all obsolete entries from the DB file.
        // This is less performant but will not clutter the DB file until the applicastion is restarted.
        // (https://github.com/louischatriot/nedb#persistence)
        DB.persistence.compactDatafile();
      }
    });
  },

  /*
  * Change subscription for document with _id: chatId to 0.
  * @param chatId: The chat id of the document to update.
  */
  removeSubscription: function(chatId, callback) {
    DB.update({ _id:chatId }, { $set: { subscription: 0 } }, {}, function(err, numReplaced) {
      if (err) {
        console.error("Failed to set subscription for user [" + chatId + "]");
      }
      else {
        console.info("Successfully set subscription for user [" + chatId + "]");

        // Clean up DB file. Remove all obsolete entries from the DB file.
        // This is less performant but will not clutter the DB file until the applicastion is restarted.
        // (https://github.com/louischatriot/nedb#persistence)
        DB.persistence.compactDatafile();
      }
    });
  }
};

module.exports = db_access;
