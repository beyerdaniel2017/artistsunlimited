'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var RepostEvent = mongoose.model('RepostEvent');
var moment = require('moment');
var User = mongoose.model('User');
var NetworkAccount = mongoose.model('NetworkAccounts');
var scheduleRepost = require("../../scheduleRepost/scheduleRepost.js");
var denyUnrepostOverlap = require('../../scheduleRepost/denyUnrepostOverlap.js');
var scConfig = require('./../../../env').SOUNDCLOUD;
var scWrapper = require("../../SCWrapper/SCWrapper.js");

scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.callbackURL
});


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
    }).populate('owner')
    .then(function(events) {
      res.send(events);
    })
    .then(null, next);
})

router.get('/repostEvent/:username/:trackTitle', function(req, res, next) {
  var data = [];
  User.findOne({
      'soundcloud.pseudoname': req.params.username
    })
    .then(function(user) {
      getUserNetwork(user._id)
        .then(function(network) {
          var networkDocIds = [user._id];
          var networkUserIds = [user.soundcloud.id];
          network.forEach(function(user) {
            networkDocIds.push(user._id);
            networkUserIds.push(user.soundcloud.id);
          })
          RepostEvent.findOne({
              userID: user.soundcloud.id,
              pseudoname: req.params.trackTitle
            })
            .then(function(event) {
              if (event && event.trackID) {
                var lowDate = new Date((new Date()).getTime() - 24 * 7 * 3600000)
                RepostEvent.find({
                    trackID: event.trackID,
                    day: {
                      $gt: lowDate
                    },
                    $or: [{
                      userID: {
                        $in: networkUserIds
                      }
                    }, {
                      owner: {
                        $in: networkDocIds
                      }
                    }]
                  })
                  .then(function(tracks) {
                    tracks.forEach(function(track) {
                      User.findOne({
                          'soundcloud.id': track.userID
                        })
                        .then(function(user) {
                          var result = {
                            trackInfo: track,
                            userInfo: user.soundcloud
                          }
                          data.push(result);
                          if (data.length == tracks.length) {
                            res.send(data);
                          }
                        }).then(null, next);
                    })
                    if (tracks.length == 0) {
                      next(new Error('No events found'));
                    }
                  })
                  .then(null, next);
              } else {
                console.log(event);
                next(new Error("No events found."));
              }
            }).then(null, next);
        }).then(null, next)
    }).then(null, next);
})

function getUserNetwork(userID) {
  return new Promise(function(resolve, reject) {
    User.findOne({
        'paidRepost.userID': userID
      })
      .then(function(adminUser) {
        var network = [];

        function addLinkedAccounts() {
          NetworkAccount.findOne({
              channels: userID
            })
            .populate('channels')
            .then(function(una) {
              if (una) {
                network = network.concat(una.channels);
                resolve(network);
              } else {
                resolve(network);
              }
            }).then(null, reject);
        }
        if (adminUser) {
          User.findById(adminUser._id).populate('paidRepost.userID')
            .then(function(user) {
              user.paidRepost.forEach(function(pr) {
                network.push(pr.userID);
              })
              addLinkedAccounts();
            }).then(null, reject)
        } else {
          addLinkedAccounts();
        }
      }).then(null, reject);
  })
}

router.get('/repostEvent/getPaidReposts/:username/:trackTitle', function(req, res, next) {
  var data = [];
  User.findOne({
      'soundcloud.pseudoname': req.params.username
    })
    .then(function(user) {
      console.log(user)
      return RepostEvent.findOne({
        userID: user.soundcloud.id,
        pseudoname: req.params.trackTitle
      })
    })
    .then(function(event) {
      var lowDate = new Date((new Date()).getTime() - 24 * 7 * 3600000)
      return RepostEvent.find({
        trackID: event.trackID,
        day: {
          $gt: lowDate
        },
        type: 'paid'
      })
    })
    .then(function(tracks) {
      tracks.forEach(function(track) {
        User.findOne({
            'soundcloud.id': track.userID
          })
          .then(function(user) {
            var result = {
              trackInfo: track,
              userInfo: user.soundcloud
            }
            data.push(result);
            if (data.length == tracks.length) {
              res.send(data);
            }
          }).then(null, next);
      })
    }).then(null, next);
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
  req.body.unrepostDate = new Date(req.body.unrepostDate);
  denyUnrepostOverlap(req.body)
    .then(function(ok) {
      console.log('ok');
      return RepostEvent.findByIdAndUpdate(req.body._id, req.body, {
        new: true,
        upsert: true
      })
    }).then(function(event) {
      event.trackID = req.body.trackID;
      event.title = req.body.title;
      event.trackURL = req.body.trackURL;
      if (event.title) event.pseudoname = event.title.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
      return event.save()
    })
    .then(function(ev) {
      ev.day = new Date(ev.day);
      res.send(ev);
    }).then(null, function(err) {
      if (err.message == 'overlap') {
        next(new Error('Issue! Please allow at least 24 hours between unreposting a track and re-reposting it and at least 48 hours between reposts of the same track.'));
      }
    })
});

router.put('/repostEvents/autofillAll', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  RepostEvent.find({
    completed: false,
    owner: req.user._id,
    trackID: null
  }).then(function(events) {
    var eventInd = 0;

    function nextEvent() {
      if (eventInd < events.length) {
        var event = events[eventInd];
        var queueInd = 0;

        function nextQueueItem() {
          if (queueInd < req.user.queue.length) {
            event.trackID = req.user.queue[queueInd];
            denyUnrepostOverlap(event)
              .then(function(ok) {
                scWrapper.setToken(req.user.soundcloud.token);
                var reqObj = {
                  method: 'GET',
                  path: '/tracks/' + event.trackID,
                  qs: {}
                }
                scWrapper.request(reqObj, function(err, data) {
                  if (!err && data.title) {
                    event.title = data.title;
                    event.trackURL = data.permalink_url;
                    event.trackArtUrl = data.artwork_url;
                    event.artistName = data.user.username;
                    if (event.title) event.pseudoname = event.title.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
                    event.save();
                    console.log(event);
                    eventInd++;
                    nextEvent();
                  } else {
                    event.trackURL = "http://api.soundcloud.com/tracks/" + event.trackID;
                    event.save();
                    console.log(event);
                    eventInd++;
                    nextEvent();
                  }
                });
              })
              .then(null, function(err) {
                console.log(err);
                queueInd++;
                nextQueueItem();
              })
          } else {
            eventInd++;
            nextEvent();
          }
        }
        nextQueueItem();
      } else {
        res.send('ok');
      }
    }
    nextEvent();
  }).then(null, next)
});

router.post('/repostEvents', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var event = new RepostEvent(req.body);
  if (event.title) event.pseudoname = event.title.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
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
  if (event.title) event.pseudoname = event.title.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
  event.save()
    .then(function(ev) {
      var scheduleDate = new Date(ev.day);
      req.body.otherChannels.forEach(function(channelID) {
        // scheduleDate = new Date(scheduleDate.getTime() + 5 * 3600000);
        var eventDetails = JSON.parse(JSON.stringify(ev));
        delete eventDetails._id;
        eventDetails.comment = undefined;
        eventDetails.userID = channelID;
        scheduleRepost(eventDetails, new Date()).then(console.log, console.log);
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