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
  var downloadTrackId = req.query.trackid;
  DownloadTrack.findById(downloadTrackId).exec()
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


  SC.put('/me/favorites/' + body.trackID, function(err, response) {
    if (err) {
      next(err);
    } else {
      Channel.find({})
        .then(function(channels) {
          channels.forEach(function(chan) {
            SC.put('/me/followings/' + chan.channelID, function(err, response) {
              if (err) {
                console.log('error following:' + chan.displayName);
                console.log(err);
              }
            });
          })
        })
        .then(null, next);
      SC.put('/me/followings/' + body.artistID, function(err, response) {
        if (err) {
          console.log('error following artist');
          console.log(err);
        } else {
          SCR.put('/e1/me/track_reposts/' + body.trackID, body.token, function(err, data) {
            if (err) {
              console.log('error reposting track');
              next(err);
            } else {
              console.log(body.playlistID);
              SCR.put('/e1/me/playlist_reposts/' + body.playlistID, body.token, function(err, data) {
                if (err) {
                  console.log('error reposting playlist');
                  next(err);
                } else {
                  res.send();
                }
              });
            }
          });
        }
      });
    }
  });
});