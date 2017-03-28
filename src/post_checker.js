'use strict';

const timestampSaveFile = 'data/MostRecentTimestamp.txt';

const request = require('request');
const fs = require('fs');

module.exports = {
  checkForNewPosts: function(callback) {
    var data;
    request({
      uri: "http://getcookie.com/group/switzerland" },
      function(error, response, body) {

        // cut away the unnecessary parts before and after the json string.
        body = body.substring(body.indexOf("INITIAL_DATA =") + 15);
        body = body.substring(0, body.indexOf("var INITIAL_SCHEMA") - 10);
        var json = JSON.parse(body);

        var previousTimestamp = fs.readFileSync(timestampSaveFile).toString();
        var newPosts = [];
        var newMostRecentTimestamp = previousTimestamp;
        if (previousTimestamp == '') {
          // set newMostRecentTimestamp to 0 to support int comparison.
          newMostRecentTimestamp = 0;
          console.log('initial startup. no timestamp saved so far.');
        } else {
          console.log('searching for new posts...');
        }

        for (var post of json.data.groups[0].posts) {
          var timestamp = post.created_at;

          if (!previousTimestamp == '') {
            // parseInt(string, base)
            if (parseInt(timestamp, 10) > parseInt(previousTimestamp, 10)) {
              newPosts.push(post);
              console.log(timestamp);
            }
          }
          // get newMostRecentTimestamp
          if (parseInt(timestamp, 10) > parseInt(newMostRecentTimestamp, 10)) {
            newMostRecentTimestamp = timestamp;
            console.log('new most recent timestamp: ' + newMostRecentTimestamp);
          }
        }

        // save newMostRecentTimestamp to file async if it changed.
        if (!(parseInt(newMostRecentTimestamp, 10) == parseInt(previousTimestamp, 10))) {
          fs.writeFile(timestampSaveFile, newMostRecentTimestamp, function(err) {
            if (err) {
              console.error(err);
            }
            console.log('[ASYNC] new timestamp saved to file.');
          });
        } else {
          console.log('newMostRecentTimestamp {' + newMostRecentTimestamp + '} is same as previousTimestamp {' + previousTimestamp + '}');
        }


        console.log("post_checker: scraping finished. New posts: " + newPosts.length);

        // return null callback if there are no new posts.
        if (newPosts.length == 0) {
          console.log('returning null callback.');
          callback(null);
          return;
        }

        // retrun callback with all new posts.
        console.log('returning new posts in callback.');
        callback(newPosts);
    });
  },
  getOp: function(uri, callback) {
    var data;
    request({
      uri: uri},
      function(error, response, body) {
        body = body.substring(body.indexOf("INITIAL_DATA =") + 15);
        body = body.substring(0, body.indexOf("var INITIAL_SCHEMA") - 10);
        var json = JSON.parse(body);

        var op = json.data.posts[0].owner.username;
        console.log(op);

        callback(op);
      });
  }
}
