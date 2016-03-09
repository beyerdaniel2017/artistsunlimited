'use strict';
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
var SC = require('node-soundcloud');
var sendMessage = require('../mandrill/sendEmail.js');

module.exports = function() {
  doRepost();
}

//executes every hour
function doRepost() {
  setTimeout(function() {
    doRepost();
  }, 10000);

  var date = new Date();
  var hour = date.getHours();

  Channel.find({}).exec()
    .then(function(channels) {
      channels.forEach(function(chan) {
        Event.find({
            channelID: chan.channelID
          }).exec()
          .then(function(events) {
            events.forEach(function(ev) {
              ev.day = new Date(ev.day);
            });
            var event = events.find(function(even) {
              return even.day.toLocaleDateString() == date.toLocaleDateString() && even.day.getHours() == date.getHours();
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
  if (!event.trackID) {
    var id = channel.queue.splice(0, 1)[0];
  } else {
    var id = event.trackID;
  }
  var scConfig = global.env.SOUNDCLOUD;
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.redirectURL,
    accessToken: channel.accessToken
  });
  SC.delete('/e1/me/track_reposts/' + id, function(err, data) {
    SC.put('/e1/me/track_reposts/' + id, function(err, data) {
      if (err) {
        sendMessage("CHRISTIAN", "coayscue@gmail.com", "ME", "coayscue@gmail.com", "ERROR REPOSTING", err.message + "   Event:" + JSON.stringify(event));
      } else {
        if (event.email) {
          sendMessage(event.name, event.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + event.name + ",<br><br>We would just like to let you know the track has been reposted on <a href='" + channel.url + "'>" + channel.displayName + "</a>! If you would like to do another round of reposts please resubmit your track to bit.ly/SoundCloudSubmission. We will get back to you ASAP and continue to do our best in making our submission process as quick and easy as possible.<br><br>How was this experience by the way? Feel free to email some feedback, suggestions or just positive reviews to feedback@peninsulamgmt.com.<br><br>Goodluck and thanks again!<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
        }
        Event.findByIdAndRemove(event._id).exec();
      }
    });
  })

}