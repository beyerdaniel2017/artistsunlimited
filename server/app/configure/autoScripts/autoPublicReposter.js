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
        if (!err) {
          event.completed = true;
          event.save();
        }
        sendMessage(err, event, user);
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
            if (owner) {
              findAgain(owner);
            }
          })
      }
    } else {
      resolve(event.trackID);
    }
  })
}

function sendMessage(err, event, user) {
  if (err) {
    if (event.email && event.name) {
      sendEmail("CHRISTIAN", "coayscue@artistsunlimited.co", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user));
      sendEmail("EDWARD", "edward@peninsulamgmt.com", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user));
      sendEmail("PENINSULA", "latropicalofficial@gmail.com", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user));
    } else {
      User.findById(event.owner).exec()
        .then(function(owner) {
          sendEmail(user.soundcloud.username, user.email, "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING TRACK!", "Error reposting! <br><br>Type: " + event.type + (!event.trackID ? " - autofill" : "") + (!!owner ? "<br>Owner: <a href=" + owner.soundcloud.permalinkURL + ">" + owner.soundcloud.username + "</a>" : "") + (!!event.title ? "<br>Title: " + event.title : "") + (!!event.trackURL ? "<br>URL: " + event.trackURL : "") + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.<br><br><br><br>Error: " + ((typeof err) == 'object' ? JSON.stringify(err) : err));
          sendEmail("Peninsula", "latropicalofficial@gmail.com", "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING TRACK!", "Error reposting! <br><br>Type: " + event.type + (!event.trackID ? " - autofill" : "") + (!!owner ? "<br>Owner: <a href=" + owner.soundcloud.permalinkURL + ">" + owner.soundcloud.username + "</a>" : "") + (!!event.title ? "<br>Title: " + event.title : "") + (!!event.trackURL ? "<br>URL: " + event.trackURL : "") + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.<br><br><br><br>Error: " + ((typeof err) == 'object' ? JSON.stringify(err) : err));
        });
    }
  } else {
    if (event.email && event.name) {
      sendEmail(event.name, event.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + event.name + ",<br><br>We would just like to let you know the track <a href='" + event.trackURL + "'>" + event.title + "</a> has been reposted on <a href='" + user.soundcloud.permalinkURL + "'>" + user.soundcloud.username + "</a>! If you would like to do another round of reposts please resubmit your track to artistsunlimited.co/submit. We will get back to you ASAP and continue to do our best in making our submission process as quick and easy as possible.<br><br>How was this experience by the way? Feel free to email some feedback, suggestions or just positive reviews to feedback@peninsulamgmt.com.<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
    }
  }
}