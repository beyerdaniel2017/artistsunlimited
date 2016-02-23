'use strict';
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
var SC = require('soundclouder');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://songsubmission.herokuapp.com/callback.html";
var sendMessage = require('../mandrill/sendEmail.js');
module.exports = function() {
  doRepost();
}

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
  SC.init(client_id, client_secret, redirect_uri);
  SC.put('/e1/me/track_reposts/' + id, channel.accessToken, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      sendMessage(sub.name, sub.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey" + sub.name + "<br><br>We would just like to let you know the track has been reposted on" + channel.displayName + "! If you would like to do another round of reposts please resubmit your song to <a href='http://etiquettenoir.co/'>Etiquette Noir</a> or <a href='http://lesol.co/'>Le Sol</a> and we will get back to you.<br><br>How was this experience by the way? Feel free to email some feedback or suggestions to feedback@peninsulamgmt.com.<br><br>Goodluck and thanks again<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
      Event.findByIdAndRemove(event._id).exec();
      Channel.findByIdAndUpdate(channel._id, channel).exec();
    }
  });
}