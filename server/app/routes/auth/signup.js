'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var SC = require('node-soundcloud');
var passport = require('passport');
var https = require('https');
var request = require('request');
var scConfig = global.env.SOUNDCLOUD;

router.post('/', function(req, res, next) {
  passport.authenticate('local-signup', function(err, user, info) {
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
      // req.login(user, function(err) {
      //   //if(req.body.rememberme && (req.body.rememberme == "1" || req.body.rememberme == 1)){
      //   req.session.cookie.expires = false;
      //   req.session.name = user.userid;
      //   req.session.cookie.expires = new Date(Date.now() + (28 * 24 * 3600000));
      //   req.session.cookie.maxAge = 28 * 24 * 3600000;
      //   req.session.cookie.expires = false;
      return res.json({
        'success': true,
        'message': '',
        'user': user
      });
      // });
    }
  })(req, res);
});