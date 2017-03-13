'use strict';

const request = require('request');

module.exports = {
  checkForNewPost: function(callback) {
    var data;
    request({
      uri: "http://getcookie.com/group/switzerland" },
      function(error, response, body) {
        body = body.substring(body.indexOf("INITIAL_DATA =") + 15);
        body = body.substring(0, body.indexOf("var INITIAL_SCHEMA") - 10);
console.log("body:" + body);
        var json = JSON.parse(body);
console.log(json.data.groups[0].id); // works!
// there are 30 posts in the json string
        var title = json.data.groups[0].posts[0].title;
console.log(title);

        var src = "asd";

        data = {text:title, image:src};
        console.log("post_checker: scraping finished " + data);
        callback(data);
    });
  }
}
