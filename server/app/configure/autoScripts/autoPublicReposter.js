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
  console.log('dorepost');
  var lowerDate = new Date();
  lowerDate.setTime(lowerDate.getTime() - lowerDate.getMinutes(0) * 60 * 1000 - lowerDate.getMinutes(0) * 1000);
  var upperDate = new Date();
  upperDate.setTime(upperDate.getTime() + 60 * 60 * 1000 - upperDate.getMinutes(0) * 60 * 1000 - upperDate.getMinutes(0) * 1000);

  RepostEvent.find({
      completed: false,
      day: {
        $gt: lowerDate,
        $lt: upperDate
      }
    }).exec()
    .then(function(events) {
      events.forEach(function(event) {
        User.findOne({
            'soundcloud.id': event.userID
          }).exec()
          .then(function(user) {
            event.day = new Date(event.day);
            event.unrepostDate = new Date(event.unrepostDate);
            repostAndRemove(event, user);
          })
          .then(null, function(err) {
            console.log(err);
          })
      })
    })
    .then(null, function(err) {
      console.log(err);
    });
}

function repostAndRemove(event, user) {
  var idPromise = getID(event, user);
  idPromise.then(function(id) {
      event.trackID = id;
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
    })
    .then(null, function() {
      console.log('no open slots');
    })
}

function getID(event, user) {
  return new Promise(function(resolve, reject) {
    var id;
    var count = 0;
    var findAgain = function(person) {
      if (count == person.queue.length) reject();
      id = person.queue.splice(0, 1)[0];
      person.queue.push(id);
      RepostEvent.find({
          trackID: id,
          day: {
            $lt: new Date(event.unrepostDate.getTime() + 24 * 3600000)
          },
          unrepostDate: {
            $gt: new Date(event.day.getTime() - 24 * 3600000)
          },
          _id: {
            $ne: event._id
          }
        })
        .then(function(events) {
          if (events.length > 0) {
            count++;
            person.save().then(function() {
              findAgain(person);
            })
          } else {
            count++;
            person.save().then(function() {
              resolve(id);
            })
          }
        })
        .then(null, console.log);
    }
    if (!event.trackID) {
      if (event.type == 'queue') {
        findAgain(user);
      } else if (event.type == 'traded') {
        User.findById(event.owner).exec()
          .then(function(owner) {
            findAgain(owner);
          })
      }
    } else {
      resolve(event.trackID);
    }
  })
}