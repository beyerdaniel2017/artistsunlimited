'use strict';
var https = require('https');
var router = require('express').Router();
var Promise = require('bluebird');

module.exports = router;

var mongoose = require('mongoose');
var DownloadTrack = mongoose.model('DownloadTrack');
var User = mongoose.model('User');
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');

var Channel = mongoose.model('Channel');

router.get('/track', function(req, res, next) {
  DownloadTrack.findById(req.query.trackID).exec()
    .then(function(downloadTrack) {
      res.send(downloadTrack);
      return res.end();
    })
    .then(null, next);
});

router.post('/tasks', function(req, res, next) {
  var body = req.body;
  console.log(req.body);
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.callbackURL,
    accessToken: body.token
  });
  SCR.init(scConfig.clientID, scConfig.clientSecret, scConfig.callbackURL);

  if (body.like) {
    SC.put('/me/favorites/' + body.trackID, function(err, response) {
      if (err) console.log('error liking: ' + JSON.stringify(err));
    });
  }
  if (body.repost) {
    SCR.put('/e1/me/track_reposts/' + body.trackID, body.token, function(err, data) {
      if (err) console.log('error reposting the track2: ' + JSON.stringify(err));
    });
  }
  if (body.comment) {
    SCR.get('/tracks/' + body.trackID, body.token, function(err, data) {
      if (err) console.log(err);
      else {
        var timestamp = Math.floor((Math.random() * data.duration));
        SCR.post('/tracks/' + body.trackID + '/comments', body.token, {
          'comment[body]': body.commentText,
          'comment[timestamp]': timestamp
        }, function(err, data) {
          if (err) console.log('error commenting: ' + JSON.stringify(err));
        });
      }
    });
  }
  if (body.artists) {
    body.artists.forEach(function(artist) {
      SC.put('/me/followings/' + artist.id, function(err, response) {
        if (err) console.log('error following: ' + JSON.stringify(err));
      });
    });
  }

  if (body.userid) {
    User.findOne({
      _id: body.userid
    }).exec().then(function(user) {
      user.permanentLinks.forEach(function(artist) {
        SC.put('/me/followings/' + artist.id, function(err, response) {
          if (err) console.log('error following: ' + JSON.stringify(err));
        });
      });
    });
  }

  if (body.playlists) {
    body.playlists.forEach(function(playlist) {
      SCR.put('/e1/me/playlist_reposts/' + playlist.id, body.token, function(err, data) {
        if (err) console.log('error reposting a playlist: ' + JSON.stringify(err))
      });
    });
  }
  SCR.put('/e1/me/track_reposts/' + body.trackID, body.token, function(err, data) {
    if (err) console.log('error reposting the track: ' + JSON.stringify(err));
  });
  DownloadTrack.findById(body._id).exec()
    .then(function(t) {
      if (t.downloadCount) t.downloadCount++;
      else t.downloadCount = 1;

      if (!t.artists) {
        t.artists = [];
      }
      if (body.userid) {
        User.findById(body.userid).exec().then(function(user) {
          user.permanentLinks.forEach(function(link) {
            SC.put('/me/followings/' + link.id, function(err, response) {
              if (err) console.log('error following: ' + JSON.stringify(err));
            });
            var exists = t.artists.some(function(artist) {
              return link.id === artist.id;
            });
            if (!exists) {
              t.artists.push(link);
            }
          });
          t.save();
        });
      } else {
        t.save();
      }
    });

  setTimeout(function() {
    res.end();
  }, 4000)
});

router.get('/track/recent', function(req, res, next) {
  var userID = req.query.userID;
  var trackID = req.query.trackID;
  DownloadTrack.find({
      userid: userID
    }).sort({
      createdOn: -1
    }).limit(6).exec()
    .then(function(downloadTracks) {
      var tracks = downloadTracks.filter(function(item) {
        return item._id.toString() !== trackID;
      });
      res.send(tracks);
      return res.end();
    })
    .then(null, next);
});