'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var SC = require('soundclouder');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://serene-sands-30935.herokuapp.com/SCCallback.html";

router.post('/', function(req, res, next) {
  console.log(req.body.password);
  if (req.body.password == 'letMeManage') {
    res.send('OK');
  } else {
    next(new Error('wrong password'));
  }
});

router.post('/authenticated', function(req, res, next) {
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
  SC.init(client_id, client_secret, redirect_uri);
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