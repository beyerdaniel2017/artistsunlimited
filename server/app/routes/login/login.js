'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var SC = require('soundclouder');

router.post('/', function(req, res, next) {
  if (req.body.password == 'letMeManage') {
    res.send('OK');
  } else {
    next(new Error('wrong password'));
  }
});

router.post('/authenticated', function(req, res, next) {
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
  var scConfig = global.env.SOUNDCLOUD;
  SC.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);
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