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
      userName: user.username ? user.username : 'null',
      firstName: user.first_name ? user.first_name : 'null',
      lastName: user.last_name ? user.last_name : 'null',
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
    DB.find({subscription:1},{},function(err, docs) {
      docs.forEach(function(user) {
        console.log('subscribed chat: ' + user._id);
        chatIds.push(user._id);
      });
      callback(chatIds);
    });
  }
};

module.exports = db_access;
