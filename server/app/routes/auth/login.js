'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var User = mongoose.model('User');
var passport = require('passport');
var https = require('https');
var request = require('request');
var scConfig = global.env.SOUNDCLOUD;
var scWrapper = require("../../SCWrapper/SCWrapper.js");

router.post('/', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
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
        delete user.password;
        delete user.salt;
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
  scWrapper.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.callbackURL
  });
  var reqObj = {method: 'GET', path: '/me', qs: {}};
  scWrapper.setToken(req.body.token);
  scWrapper.request(reqObj, function(err, data){
    if (err) {
      next(err);
    } else {
      var sendObj = {};
      Channel.findOneAndUpdate({
          channelID: data.id
        }, {
          accessToken: req.body.token,
          followerCount: data.followers_count,
          price: parseFloat(data.followers_count / 3000.0).toFixed(2)
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
    }
  });
});

router.post('/soundCloudLogin', function(req, res, next) {
  passport.authenticate('local-soundcloud', function(err, user, info) {
    if (err) {
      return res.json({
        success: false,
        "message": err
      });
    }
    if (!user) {
      return res.json({
        success: false,
        "message": "Error in processing your request"
      });
    } else {
      req.login(user, function(err) {
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