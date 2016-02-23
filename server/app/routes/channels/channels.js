'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');

router.get('/', function(req, res, next) {
  Channel.find({}).exec()
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
  Channel.remove({}, function(err) {});
  var names = [{
    channelID: '86560544',
    displayName: 'La Tropical',
    url: 'https://soundcloud.com/latropical'
  }, {
    channelID: '198031384',
    displayName: 'La Tropical Mixes',
    url: 'https://soundcloud.com/latropicalmixes'
  }, {
    channelID: '206926900',
    displayName: 'Red Tag',
    url: 'https://soundcloud.com/red-tag'
  }, {
    channelID: '64684860',
    displayName: 'Etiquette Noir',
    url: 'https://soundcloud.com/etiquettenoir'
  }, {
    channelID: '164339022',
    displayName: 'Le Sol',
    url: 'https://soundcloud.com/lesolmusique'
  }, {
    channelID: '203522426',
    displayName: 'Classy Records',
    url: 'https://soundcloud.com/onlyclassy'
  }];
  for (var i in names) {
    var channel = new Channel(names[i]);
    channel.price = 1;
    channel.save();
  }
  res.send('done');
});