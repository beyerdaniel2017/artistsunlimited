'use strict';
var https = require('https');
var router = require('express').Router();
var Promise = require('bluebird');

module.exports = router;

var mongoose = require('mongoose');
var DownloadTrack = mongoose.model('DownloadTrack');
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var SC = require('node-soundcloud');
var SCR = require('soundclouder');

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
      else res.send({});
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
      })
    });
  }
  if (body.playlists) {
    body.playlists.forEach(function(playlist) {
      SCR.put('/e1/me/playlist_reposts/' + playlist.id, body.token, function(err, data) {
        if (err) console.log('error reposting a playlist: ' + JSON.stringify(err))
      });
    });
  }
  DownloadTrack.findById(body._id).exec()
    .then(function(t) {
      if (t.downloadCount) t.downloadCount++;
      else t.downloadCount = 1;
      t.save();
    })
});