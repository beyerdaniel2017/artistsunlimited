'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var RepostEvent = mongoose.model('RepostEvent');
var moment = require('moment');
var User = mongoose.model('User');
var scheduleRepost = require("../../scheduleRepost/scheduleRepost.js");


//----------Public Repost Events----------
router.get('/forUser/:id', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var date = moment().month(new Date().getMonth()).date(new Date().getDate() - 7).hours(0).minutes(0).seconds(0).milliseconds(0).format();
  RepostEvent.find({
    userID: req.params.id,
    day: {
      $gte: date
    }
  })

  .then(function(events) {
      res.send(events);
    })
    .then(null, next);
})

router.get('/respostEvent/:id', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var data = [];
  RepostEvent.findOne({
    _id: req.params.id,
  })

  .then(function(event) {
      RepostEvent.find({
        trackID: event.trackID
      })

      .then(function(tracks) {
          var i = -1;

          function next() {
            i++;
            if (i < tracks.length) {
              var userid = parseInt(tracks[i].userID);
              User.findOne({
                'soundcloud.id': userid
              }, function(err, user) {
                var result = {
                  trackInfo: tracks[i],
                  userInfo: user.soundcloud
                }
                data.push(result);
                next();
              });
            } else {
              res.send(data);
            }
          }
          next();
        })
        .then(null, next);
    })
    .then(null, next);
})

/*Get Repost events for List*/
router.get('/listEvents/:id', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var query;
  var fromDate = req.query.date ? moment().month(new Date(req.query.date).getMonth()).date(new Date(req.query.date).getDate()).hours(0).minutes(0).seconds(0).milliseconds(0).format() : moment().month(new Date().getMonth()).date(new Date().getDate()).hours(0).minutes(0).seconds(0).milliseconds(0).format();
  var toDate = req.query.date ? moment().month(new Date(req.query.date).getMonth()).date(new Date(req.query.date).getDate() + 6).hours(23).minutes(59).seconds(59).milliseconds(999).format() : moment().month(new Date().getMonth()).date(new Date().getDate()).hours(23).minutes(59).seconds(59).milliseconds(999).format();
  RepostEvent.find({
    userID: req.params.id,
    day: {
      $gte: fromDate,
      $lte: toDate
    }
  })

  .then(function(events) {
      res.send(events);
    })
    .then(null, next);
})

router.put('/repostEvents', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  denyTradeOverlap(req.body)
    .then(function(ok) {
      return RepostEvent.findByIdAndUpdate(req.body._id, req.body, {
        new: true,
        upsert: true
      })
    }).then(function(event) {
      event.trackID = req.body.trackID;
      event.title = req.body.title;
      event.trackURL = req.body.trackURL;
      return event.save()
    })
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev);
    }).then(null, next)
});

function denyTradeOverlap(repostEvent) {
  repostEvent.day = new Date(repostEvent.day);
  var unrepostDate = new Date(repostEvent.day.getTime() + (parseInt(repostEvent.unrepostHours) * 60 * 60 * 1000));
  repostEvent.unrepostDate = new Date(unrepostDate);
  return RepostEvent.find({
    userID: repostEvent.userID,
    trackID: repostEvent.trackID
  }).then(function(events) {
    var blockEvents = events.filter(function(event) {
      event.day = new Date(event.day);
      event.unrepostDate = new Date(event.unrepostDate);
      return (repostEvent.trackID == event.trackID && (Math.abs(event.unrepostDate.getTime() - repostEvent.day.getTime()) < 24 * 3600000 || Math.abs(event.day.getTime() - repostEvent.unrepostDate.getTime()) < 24 * 3600000));
    })
    if (blockEvents.length > 0) throw new Error('Issue! This repost will cause this track to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.')
    else return 'ok';
  })
}

router.post('/repostEvents', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var event = new RepostEvent(req.body);
  event.save()
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev)
    })
    .then(null, next);
});

router.post('/repostEventsScheduler', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var event = new RepostEvent(req.body);
  event.save()
    .then(function(ev) {
      var scheduleDate = new Date(ev.day);
      req.body.otherChannels.forEach(function(channelID) {
        scheduleDate = new Date(scheduleDate.getTime() + 5 * 3600000);
        eventDetails = ev;
        eventDetails.comment = undefined;
        eventDetails.userID = channelID;
        scheduleRepost(eventDetails, scheduleDate);
      })
      res.send(ev)
    }).then(null, next);
});

router.delete('/repostEvents/:id', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  RepostEvent.findByIdAndRemove(req.params.id)
    .then(function(event) {
      event.day = new Date(event.day);
      res.send(event);
    })
    .then(null, next);
});

router.post('/saveAvailableSlots', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  User.findOneAndUpdate({
      _id: req.body.id
    }, {
      $set: {
        availableSlots: req.body.availableslots
      }
    }, {
      upsert: true,
      new: true
    })
    .then(function(ev) {
      res.send(ev);
    })
    .then(null, next);
})

router.get('/getRepostEvents/:id', function(req, res, next) {
  var data = [];
  RepostEvent.find({
      owner: req.params.id,
      type: 'traded'
    })
    .sort({
      day: 1
    })

  .then(function(tracks) {
      var i = -1;

      function next() {
        i++;
        if (i < tracks.length) {
          var userid = parseInt(tracks[i].userID);
          User.findOne({
            'soundcloud.id': userid
          }, function(err, user) {
            if (user) {
              var result = {
                trackInfo: tracks[i],
                userInfo: user.soundcloud
              }
              data.push(result);
            }
            next();
          });
        } else {
          res.send(data);
        }
      }
      next();
    })
    .then(null, next);
});

// router.put('/', function(req, res, next) {
//   Event.findByIdAndUpdate(req.body._id, req.body, {
//       new: true
//     })
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
//   Event.findByIdAndRemove(req.params.id)
//     .then(function(event) {
//       event.day = new Date(event.day);
//       res.send(event);
//     })
//     .then(null, next);
// });