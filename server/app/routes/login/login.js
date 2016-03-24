'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var SC = require('soundclouder');
var passport = require('passport');
var https = require('https');
var request = require('request');
var scConfig = global.env.SOUNDCLOUD

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.json({
        success: false,
        "message": err
      });
    }
    if (!user) {
      return res.json({
        success: false,
        "message": "Invalid Username or Password"
      });
    } else {
      req.login(user, function(err) {
        //if(req.body.rememberme && (req.body.rememberme == "1" || req.body.rememberme == 1)){
        req.session.cookie.expires = false;
        req.session.name = user.userid;
        req.session.cookie.expires = new Date(Date.now() + (28 * 24 * 3600000));
        req.session.cookie.maxAge = 28 * 24 * 3600000;
        req.session.cookie.expires = false;
        return res.json({
          'success': true,
          'message': '',
          'user': user
        });
      });
    }
  })(req, res);
});

router.post('/authenticated', function(req, res, next) {
  // request.post({
  //   url: 'http://pure-beyond-79652.herokuapp.com/api/soundcloud/authenticated',
  //   form: {
  //     token: req.body.token
  //   }
  // }, function(error, response, body) {
  SC.init(scConfig.SOUNDCLOUD_CLIENT_ID, scConfig.SOUNDCLOUD_CLIENT_SECRET, scConfig.SOUNDCLOUD_CALLBACK_URL);
  SC.get('/me', req.body.token, function(err, data) {
    if (err) {
      next(err);
    } else {
      var data = JSON.parse(body);
      var sendObj = {};
      Channel.findOneAndUpdate({
          channelID: data.id
        }, {
          accessToken: req.body.body.token
        }).exec()
        .then(function(channel) {
          sendObj.channel = channel;
          return Event.find({
            channelID: data.id
          }).exec();
        })
        .then(function(events) {
          sendObj.events = events;
          return Submission.find({
            channelIDS: data.id
          }).exec();
        })
        .then(function(submissions) {
          sendObj.submissions = submissions;
          res.send(sendObj);
        })
        .then(null, next);
      res.send(track);
    }
  });
  // if (!error && response.statusCode == 200) {
  //   // Show the HTML for the Google homepage. 
  // } else {
  //   next(err);
  // }
  // });
});