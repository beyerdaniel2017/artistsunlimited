'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');

router.get('/', function(req, res, next) {
  Channel.find({
      active: true
    })
    .exec()
    .then(function(channels) {
      channels.forEach(function(c) {
        c.accessToken = undefined;
      });
      res.send(channels);
    })
    .then(null, next);
});


router.put('/', function(req, res, next) {
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
  Channel.findByIdAndUpdate(req.body._id, req.body, {
      new: true
    }).exec()
    .then(function(channel) {
      res.send(channel);
    })
    .then(null, next);
})



router.post('/initializeDBBaby', function(req, res, next) {
  var names = [{
    channelID: '86560544',
    displayName: 'La Tropical',
    url: 'https://soundcloud.com/latropical'
  }, {
    channelID: '198031384',
    displayName: 'Test Account',
    url: 'https://soundcloud.com/latropicalmixes'
  }];
  for (var i in names) {
    var channel = new Channel(names[i]);
    channel.active = true;
    channel.price = 10;
    channel.save();
  }
  res.send('done');
});