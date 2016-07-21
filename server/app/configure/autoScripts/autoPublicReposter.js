var mongoose = require('mongoose');
var User = mongoose.model('User');
var Trade = mongoose.model('Trade');
var RepostEvent = mongoose.model('RepostEvent');
var scWrapper = require("../../SCWrapper/SCWrapper.js");
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var request = require('request');

module.exports = doRepost;
//executes every 5 min
function doRepost() {
  setTimeout(function() {
    doRepost();
  }, 300000);
  var lowerDate = new Date();
  lowerDate.setTime(lowerDate.getTime() - lowerDate.getMinutes() * 60 * 1000 - lowerDate.getSeconds() * 1000 - 60 * 60 * 1000 * 15);
  var upperDate = new Date();
  upperDate.setTime(upperDate.getTime() - upperDate.getMinutes() * 60 * 1000 - upperDate.getSeconds() * 1000 + 60 * 60 * 1000);

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
            repostAndRemove(event, user, 0);
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

function repostAndRemove(event, user, repCount) {
  var message = {
    type: 'alert',
    senderId: event.owner,
    date: new Date()
  };
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
          message.text = 'A track was reposted on ' + user.soundcloud.username;
          putMessage(event, user, message);
        } else {
          console.log('error ------------------');
          console.log(err);
          console.log(data);
          var now = new Date();
          if (now.getMinutes() >= 55) {
            sendMessage(err, event, user);
            message.text = 'There was an error reposting a track on ' + user.soundcloud.username;
            putMessage(event, user, message);
          }
        }
      });
    })
    .then(null, function() {})
}

/*Update Message*/
function putMessage(event, user, message) {
  var query = {
    $or: [{
      'p2.user': user._id,
      'p1.user': event.owner
    }, {
      'p2.user': event.owner,
      'p1.user': user._id
    }]
  };
  Trade.update(query, {
      $addToSet: {
        messages: message
      }
    })
    .exec()
    .then(function(data) {
      //Success
    })
    .then(null, function(error) {
      //Error
    });
}

function getID(event, user) {
  return new Promise(function(resolve, reject) {
    var id;
    var count = 0;
    var findAgain = function(person) {
      console.log(count);
      if (count >= person.queue.length) reject();
      id = person.queue.splice(0, 1)[0];
      person.queue.push(id);
      scWrapper.setToken(user.soundcloud.token);
      var reqObj = {
        method: 'GET',
        path: '/tracks/' + id,
        qs: {}
      }
      scWrapper.request(reqObj, function(err, data) {
        if (!err && data.user.id != person.soundcloud.id) {
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
        } else {
          count++;
          person.save().then(function() {
            findAgain(person);
          })
        }
      });
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
      sendEmail("CHRISTIAN", "coayscue@artistsunlimited.co", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user).name);
      sendEmail("EDWARD", "edward@peninsulamgmt.com", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user).name);
      sendEmail("PENINSULA", "latropicalofficial@gmail.com", "AU Server", "coayscue@artistsunlimited.co", "PAID REPOST ERROR", "-----------------<br>Error with paid repost: " + ((typeof err) == 'object' ? JSON.stringify(err) : err) + "<br><br>-----------------<br><br>  Repost Event: " + JSON.stringify(event) + "<br><br>on<br><br>User: " + JSON.stringify(user).name);
    } else {
      User.findById(event.owner).exec()
        .then(function(owner) {
          sendEmail(user.soundcloud.username, user.email, "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING TRACK!", "Hey " + user.soundcloud.username + ",<br><br>There was an error reposting a track!<br><br>Type: " + event.type + (!event.trackID ? " - autofill" : "") + (!!owner ? "<br>Owner: <a href=" + owner.soundcloud.permalinkURL + ">" + owner.soundcloud.username + "</a>" : "") + (!!event.title ? "<br>Title: " + event.title : "") + (!!event.trackURL ? "<br>URL: " + event.trackURL : "") + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.<br><br><br><br>Error: " + ((typeof err) == 'object' ? JSON.stringify(err) : err));
          sendEmail("Peninsula", "latropicalofficial@gmail.com", "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING TRACK!", "Hey " + user.soundcloud.username + ",<br><br>There was an error reposting a track!<br><br>Type: " + event.type + (!event.trackID ? " - autofill" : "") + (!!owner ? "<br>Owner: <a href=" + owner.soundcloud.permalinkURL + ">" + owner.soundcloud.username + "</a>" : "") + (!!event.title ? "<br>Title: " + event.title : "") + (!!event.trackURL ? "<br>URL: " + event.trackURL : "") + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.<br><br><br><br>Error: " + ((typeof err) == 'object' ? JSON.stringify(err) : err));
          sendEmail("Christian", "coayscue@gmail.com", "Artists Unlimited", "coayscue@artistsunlimited.co", "ERROR REPOSTING TRACK!", "Hey " + user.soundcloud.username + ",<br><br>There was an error reposting a track!<br><br>Type: " + event.type + (!event.trackID ? " - autofill" : "") + (!!owner ? "<br>Owner: <a href=" + owner.soundcloud.permalinkURL + ">" + owner.soundcloud.username + "</a>" : "") + (!!event.title ? "<br>Title: " + event.title : "") + (!!event.trackURL ? "<br>URL: " + event.trackURL : "") + "<br><br>The issue is likely that your access token has expired. Simply log back into <a href='https://artistsunlimited.co/login'>Artist Tools</a> to fix this.<br><br><br><br>Error: " + ((typeof err) == 'object' ? JSON.stringify(err) : err));
        });
    }
  } else {
    if (event.email && event.name) {
      sendEmail(event.name, event.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + event.name + ",<br><br>We would just like to let you know the track <a href='" + event.trackURL + "'>" + event.title + "</a> has been reposted on <a href='" + user.soundcloud.permalinkURL + "'>" + user.soundcloud.username + "</a>! If you would like to do another round of reposts please resubmit your track to artistsunlimited.co/submit. We will get back to you ASAP and continue to do our best in making our submission process as quick and easy as possible.<br><br>How was this experience by the way? Feel free to email some feedback, suggestions or just positive reviews to feedback@peninsulamgmt.com.<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
    }
  }
}