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
var scWrapper = require("../../SCWrapper/SCWrapper.js");
var Channel = mongoose.model('Channel');

scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.callbackURL
});

router.get('/track', function(req, res, next) {
  DownloadTrack.findById(req.query.trackID).exec()
    .then(function(downloadTrack) {
      res.send(downloadTrack);
    })
    .then(null, next);
});

router.post('/tasks', function(req, res, next) {
  var body = req.body;
  scWrapper.setToken(body.token);
  var reqObj = {};
  if (body.like) {
    scWrapper.request({method: 'PUT', path: '/me/favorites/' + body.trackID, qs: {oauth_token: body.token}}, function(err, response){
      if (err) console.log('error liking: ' + JSON.stringify(err));
    });
  }
  if (body.repost) {
    scWrapper.request({method: 'PUT', path: '/e1/me/track_reposts/' + body.trackID, qs: {oauth_token: body.token}}, function(err, response){
      if (err) console.log('error reposting the track2: ' + JSON.stringify(err));
    });
  }
  if (body.comment) {
    scWrapper.request({method: 'GET', path:'/tracks/' + body.trackID, qs: {oauth_token: body.token}}, function(err, data){
      if (err) console.log(err);
      else {
        var timestamp = Math.floor((Math.random() * data.duration));
        scWrapper.request({method: 'POST', path:'/tracks/' + body.trackID + '/comments', qs: {oauth_token: body.token, 'comment[body]': body.commentText, 'comment[timestamp]': timestamp}}, function(err, data){
          if (err) console.log('error commenting: ' + JSON.stringify(err));
        });
      }
    });
  }
  if (body.artists) {
    body.artists.forEach(function(artist) {
      scWrapper.request({method: 'PUT', path:'/me/followings/' + artist.id, qs: {oauth_token: body.token}}, function(err, response){
        if (err) console.log('error following added artist: ' + JSON.stringify(err));
      });
    });
  }
  if (body.userid) {
    User.findOne({
      _id: body.userid
    }).exec().then(function(user) {
      user.permanentLinks.forEach(function(artist) {
        scWrapper.request({method: 'PUT', path:'/me/followings/' + artist.id, qs: {oauth_token: body.token}}, function(err, response){
          if (err) console.log('error following a permanet: ' + JSON.stringify(err));
        });
      });
    });
  }
  if (body.artistID) {
    scWrapper.request({method: 'PUT', path:'/me/followings/' + body.artistID, qs: {oauth_token: body.token}}, function(err, response){
      if (err) console.log('error following main artist: ' + JSON.stringify(err));
    });
  }
  if (body.playlists) {
    body.playlists.forEach(function(playlist) {
      scWrapper.request({method: 'PUT', path:'/e1/me/playlist_reposts/' + playlist.id, qs: {oauth_token: body.token}}, function(err, data){
        if (err) console.log('error reposting a playlist: ' + JSON.stringify(err))
      });
      scWrapper.request({method: 'PUT', path:'/e1/me/playlist_likes/' + playlist.id, qs: {oauth_token: body.token}}, function(err, data){
        if (err) console.log('error liking a playlist: ' + JSON.stringify(err))
      });
    });
  }
  scWrapper.request({method: 'PUT', path:'/e1/me/track_reposts/' + body.trackID, qs: {oauth_token: body.token}}, function(err, data) {
    if (err) console.log('error reposting the track: ' + JSON.stringify(err));
  });
  DownloadTrack.findById(body._id).exec()
    .then(function(t) {
      if (t.downloadCount) t.downloadCount++;
      else t.downloadCount = 1;
      t.save();
      res.end();
    })
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