'use strict';

const request = require('request');

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

        var previousNewestTimeStamp = 1490532310;
        // there are always 30 posts in the json string
        var newPosts = [];
        for (var i = 0; i < 30; i++) {
          var timestamp = json.data.groups[0].posts[i].created_at;
          if (timestamp > previousNewestTimeStamp) {
            newPosts.push(json.data.groups[0].posts[i]);
            console.log(timestamp);
          }
        }

        data = newPosts;
        console.log("post_checker: scraping finished " + data);
        callback(data);
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
