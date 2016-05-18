'use strict';
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
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

  var date = new Date();
  var hour = date.getHours();

  Channel.find({}).exec()
    .then(function(channels) {
      channels.forEach(function(chan) {
        Event.find({
            channelID: chan.channelID
          })
          .exec()
          .then(function(events) {
            events.forEach(function(ev) {
              ev.day = new Date(ev.day);
            });
            var event = events.find(function(even) {
              return even.day.toLocaleDateString() == date.toLocaleDateString() && even.day.getHours() == date.getHours() && !even.completed;
            });
            if (event) repostAndRemove(event, chan);
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

function repostAndRemove(event, channel) {
  if (event.paid && !event.trackID) {
    var id = channel.queue.splice(0, 1)[0];
    channel.save();
  } else {
    var id = event.trackID;
  }
  if (id) {
    scWrapper.setToken(channel.accessToken);
    var reqObj = {
      method: 'PUT',
      path: '/e1/me/track_reposts/' + id,
      qs: {
        oauth_token: channel.accessToken
      }
    };
    scWrapper.request(reqObj, function(err, data) {
      if (err) {
        sendEmail("CHRISTIAN", "coayscue@artistsunlimited.co", "ERROR", "coayscue@artistsunlimited.co", "ERROR REPOSTING", "Error: Posting: " + err + "<br><br>Res Data: " + JSON.stringify(data) + "<br><br>  Event: " + JSON.stringify(event));
      } else {
        if (event.email) {
          sendEmail(event.name, event.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + event.name + ",<br><br>We would just like to let you know the track <a href='" + event.trackURL + "'>" + event.title + "</a> has been reposted on <a href='" + channel.url + "'>" + channel.displayName + "</a>! If you would like to do another round of reposts please resubmit your track to <a href='artistsunlimited.co/submit'>artistsunlimited.co/submit</a>. We will get back to you ASAP and continue to do our best in making our submission process as quick and easy as possible.<br><br>How was this experience by the way? Feel free to email some feedback, suggestions or just positive reviews to feedback@peninsulamgmt.com.<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
        }
        event.completed = true;
        Event.findByIdAndUpdate(event._id, event).exec();
      }
    });
  } else {
    sendEmail("CHRISTIAN", "coayscue@artistsunlimited.co", "ERROR", "coayscue@artistsunlimited.co", "ERROR REPOSTING", "An event with no data tried to be reposted");
  }
}