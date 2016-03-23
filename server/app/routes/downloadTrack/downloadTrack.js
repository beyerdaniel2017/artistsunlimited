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
var Channel = mongoose.model('Channel');

router.get('/track', function(req, res, next) {
  var downloadTrackId = req.query.trackid;
  DownloadTrack
    .find({
      _id: downloadTrackId
    })
    .exec()
    .then(function(downloadTrack) {
      res.send(downloadTrack);
      return res.end();
    })
    .catch(next);
});

router.post('/tasks', function(req, res, next) {
  var body = req.body;
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.redirectURL,
    accessToken: body.token
  });


  SC.put('/me/favorites/' + body.trackId, function(err, response) {
    if (err) {
      return next(err);
    }
    Channels.find({})
      .then(function(channels) {
        channels.forEach(function(chan) {
          SC.put('/me/followings/' + chan.channelID, function(err, response) {
            if (err) {
              return next(err);
            }
            console.log(chan.displayName);

          });
        })
      })

    // Need to call repost api but it is returning unauthorized 401
    res.send();
    return res.end();
  });
});