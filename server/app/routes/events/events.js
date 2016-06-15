'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var RepostEvent = mongoose.model('RepostEvent');

router.put('/', function(req, res, next) {
  Event.findByIdAndUpdate(req.body._id, req.body, {
      new: true
    }).exec()
    .then(function(event) {
      event.trackID = req.body.trackID;
      return event.save()
    })
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev);
    })
    .then(null, next);
});

router.post('/', function(req, res, next) {
  var event = new Event(req.body);
  event.save()
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev)
    })
    .then(null, next);
});

router.delete('/:id', function(req, res, next) {
  Event.findByIdAndRemove(req.params.id).exec()
    .then(function(event) {
      event.day = new Date(event.day);
      res.send(event);
    })
    .then(null, next);
});

//----------Public Repost Events----------
router.get('/forUser/:id', function(req, res, next) {
  var date = new Date();
  date.setDate(date.getDate()-1);
  date.setHours(0,0,0,0);
  RepostEvent.find({
    userID: req.params.id,
    day : {
      $gte: date
    }
  })
  .exec()
    .then(function(events) {
      res.send(events);
    })
    .then(null, next);
})

router.put('/repostEvents', function(req, res, next) {
  RepostEvent.findByIdAndUpdate(req.body._id, req.body, {
      new: true,
      upsert: true
    }).exec()
    .then(function(event) {
      event.trackID = req.body.trackID;
      event.title = req.body.title;
      event.trackURL = req.body.trackURL;
      return event.save()
    })
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev);
    })
    .then(null, next);
});

router.post('/repostEvents', function(req, res, next) {
  var event = new RepostEvent(req.body);
  event.save()
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev)
    })
    .then(null, next);
});

router.delete('/repostEvents/:id', function(req, res, next) {
  RepostEvent.findByIdAndRemove(req.params.id).exec()
    .then(function(event) {
      event.day = new Date(event.day);
      res.send(event);
    })
    .then(null, next);
});