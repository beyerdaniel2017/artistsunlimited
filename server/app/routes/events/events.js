'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var RepostEvent = mongoose.model('RepostEvent');
//----------Public Repost Events----------
router.get('/forUser/:id', function(req, res, next) {
  var date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(0, 0, 0, 0);
  RepostEvent.find({
      userID: req.params.id,
      day: {
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

router.post('/repostEventsScheduler', function(req, res, next) {
  var event = new RepostEvent(req.body);
  event.save()
    .then(function(ev) {
      var nextRepTime = new Date(ev.day);
      req.body.otherChannels.forEach(function(channelID) {
        req.body.unrepostDate = new Date(req.body.unrepostDate);
        nextRepTime = new Date(nextRepTime.getTime() + req.body.timeGap * 60 * 60 * 1000);
        var scheduleEvent = function(chanID, repostDate) {
          if (req.body.unrepostDate.getTime() > 100000000) var unrepostDate = new Date(repostDate.getTime() + 24 * 60 * 60 * 1000);
          else var unrepostDate = new Date(0);
          RepostEvent.findOne({
              $or: [{
                userID: chanID,
                trackID: req.body.trackID,
                day: {
                  $lt: unrepostDate.getTime() + 24 * 3600 * 1000
                },
                unrepostDate: {
                  $gt: repostDate.getTime() - 24 * 3600 * 1000
                }
              }, {
                userID: chanID,
                day: {
                  $lt: repostDate.getTime() - repostDate.getMinutes() * 60 * 1000 + 24 * 3600 * 1000,
                  $gt: repostDate.getTime() - repostDate.getMinutes() * 60 * 1000
                }
              }]
            }).exec()
            .then(function(ev) {
              console.log(ev);
              if (!ev) {
                var ev = new RepostEvent(req.body);
                ev.day = repostDate;
                ev.unrepostDate = unrepostDate;
                ev.userID = chanID;
                ev.save()
                  .then(function(eve) {
                    console.log(eve)
                  }, console.log);
              } else {
                scheduleEvent(chanID, new Date(repostDate.getTime() + 60 * 60 * 1000));
              }
            })
            .then(null, console.log);
        }
        scheduleEvent(channelID, nextRepTime)
      })
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

// router.put('/', function(req, res, next) {
//   Event.findByIdAndUpdate(req.body._id, req.body, {
//       new: true
//     }).exec()
//     .then(function(event) {
//       event.trackID = req.body.trackID;
//       return event.save()
//     })
//     .then(function(ev) {
//       ev.day = new Date(ev.day);
//       res.send(ev);
//     })
//     .then(null, next);
// });

// router.post('/', function(req, res, next) {
//   var event = new Event(req.body);
//   event.save()
//     .then(function(ev) {
//       ev.day = new Date(ev.day);
//       res.send(ev)
//     })
//     .then(null, next);
// });

// router.delete('/:id', function(req, res, next) {
//   Event.findByIdAndRemove(req.params.id).exec()
//     .then(function(event) {
//       event.day = new Date(event.day);
//       res.send(event);
//     })
//     .then(null, next);
// });