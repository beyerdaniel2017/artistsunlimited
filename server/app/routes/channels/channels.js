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
  Channel.findByIdAndUpdate(req.body._id, req.body, {
      new: true
    }).exec()
    .then(function(channel) {
      res.send(channel);
    })
    .then(null, next);
})