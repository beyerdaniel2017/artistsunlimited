'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

router.put('/', function(req, res, next) {
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
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
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
  var event = new Event(req.body);
  event.save()
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev)
    })
    .then(null, next);
});

router.delete('/:id/:password', function(req, res, next) {
  if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  Event.findByIdAndRemove(req.params.id).exec()
    .then(function(event) {
      event.day = new Date(event.day);
      res.send(event);
    })
    .then(null, next);
})