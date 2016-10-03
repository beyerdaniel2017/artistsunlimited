'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
  User.find({
      role: 'paid repost'
    })
    .then(function(users) {
      users.forEach(function(u) {
        if (u.soundcloud.token) u.soundcloud.token = undefined;
      });
      res.send(users);
    })
    .then(null, next);
});

router.put('/', function(req, res, next) {
  Channel.findByIdAndUpdate(req.body._id, req.body, {
      new: true
    })
    .then(function(channel) {
      res.send(channel);
    })
    .then(null, next);
})