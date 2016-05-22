'use strict';
var mongoose = require('mongoose');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var scWrapper = require("../../SCWrapper/SCWrapper.js");
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var request = require('request');

scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.redirectURL
});

module.exports = doRepost;
//executes every hour
function doRepost() {
  setTimeout(function() {
    doRepost();
  }, 1800000);

  var lowerDate = new Date();
  lowerDate.setTime(lowerDate.getTime() - lowerDate.getMinutes(0) * 60 * 1000 - lowerDate.getMinutes(0) * 1000);
  var upperDate = new Date();
  upperDate.setTime(upperDate.getTime() + 60 * 60 * 1000 - upperDate.getMinutes(0) * 60 * 1000 - upperDate.getMinutes(0) * 1000);

  User.find({}).exec()
    .then(function(users) {
      users.forEach(function(user) {
        RepostEvent.findOne({
            userID: user.soundcloud.id,
            completed: false,
            day: {
              $gt: lowerDate,
              $lt: upperDate
            }
          })
          .exec()
          .then(function(event) {
            if (event) repostAndRemove(event, user);
          })
          .then(null, function(err) {
            console.log(err);
          })
      });
    })
    .then(null, function(err) {
      console.log(err);
    });
}

function repostAndRemove(event, user) {
  if (event.type == 'queue') {
    var id = user.queue.splice(0, 1)[0];
    user.save();
  } else {
    var id = event.trackID;
  }
  if (id) {
    scWrapper.setToken(user.soundcloud.token);
    var reqObj = {
      method: 'PUT',
      path: '/e1/me/track_reposts/' + id,
      qs: {
        oauth_token: user.soundcloud.token
      }
    };
    scWrapper.request(reqObj, function(err, data) {
      if (err) {
        sendEmail(user.soundcloud.username, user.email, "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING", "Error reposting: " + JSON.stringify(event) + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.");
      } else {
        event.completed = true;
        event.save();
      }
    });
  }
}