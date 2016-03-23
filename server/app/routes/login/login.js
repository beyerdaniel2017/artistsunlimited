'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var SC = require('soundclouder');
var passport = require('passport');

router.post('/', function(req, res, next) {
  // console.log(req.body);
  // if (req.body.password == 'letMeManage') {
  //   res.send('OK');
  // } else {
  //   next(new Error('wrong password'));
  // }
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
  //if (req.body.password != "letMeManage") next(new Error("Wrong password"));
  var scConfig = global.env.SOUNDCLOUD;
  SC.init(scConfig.clientID, scConfig.clientSecret, scConfig.callbackURL);
  SC.get('/me', req.body.token, function(err, data) {
    var sendObj = {};
    Channel.findOneAndUpdate({
        channelID: data.id
      }, {
        accessToken: req.body.token
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
  });
});