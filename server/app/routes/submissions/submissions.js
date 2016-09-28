'use strict';
var scConfig = global.env.SOUNDCLOUD;
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var Event = mongoose.model('Event');
var Email = mongoose.model('Email');
var rootURL = require('../../../env').ROOTURL;
var Promise = require('promise');
var scConfig = global.env.SOUNDCLOUD;
var sendEmail = require("../../mandrill/sendEmail.js"); //takes: to_name, to_email, from_name, from_email, subject, message_html
var paypalCalls = require("../../payPal/paypalCalls.js");
var scWrapper = require("../../SCWrapper/SCWrapper.js");
scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.redirectURL
});

router.post('/', function(req, res, next) {
  var submission = new Submission(req.body);
  submission.invoiceIDS = [];
  submission.paidInvoices = [];
  submission.submissionDate = new Date();
  submission.save()
    .then(function(sub) {
      res.send(sub);
    })
    .then(null, next);
});

router.get('/unaccepted', function(req, res, next) {
  if (!req.user.role == 'admin' || !req.user.role == 'superadmin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    var resultSubs = [];
    var skipcount = req.query.skip;
    var limitcount = req.query.limit;
    var genre = req.query.genre ? req.query.genre : undefined;
    var paidRepostIds = [];
    if (req.user.paidRepost.length > 0) {
      req.user.paidRepost.forEach(function(acc) {
        paidRepostIds.push(acc.userID);
      })
    }
    var query = {
      channelIDS: [],
      userID: {
        $in: paidRepostIds
      },
      status: "submitted"
    };
    if (genre != undefined && genre != 'null') {
      query.genre = genre;
    }
    Submission.find(query).sort({
        submissionDate: 1
      })
      .populate('userID')
      .skip(skipcount)
      .limit(limitcount)
      .exec()
      .then(function(subs) {
        var i = -1;
        var next = function() {
          i++;
          if (i < subs.length) {
            var sub = subs[i].toJSON();
            sub.approvedChannels = [];
            Submission.find({
                email: sub.email
              })
              .exec()
              .then(function(oldSubs) {
                oldSubs.forEach(function(oldSub) {
                  sub.approvedChannels = sub.approvedChannels.concat(oldSub.paidChannelIDS)
                });
                resultSubs.push(sub);
                next();
              })
              .then(null, next);
          } else {
            res.send(resultSubs);
          }
        }
        next();
      })
      .then(null, next);
  }
});

router.get('/getMarketPlaceSubmission', function(req, res, next) {
  if (!req.user.role == 'admin' || !req.user.role == 'superadmin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    var resultSubs = [];
    var skipcount = req.query.skip;
    var limitcount = req.query.limit;
    var genre = req.query.genre ? req.query.genre : undefined;
    var paidRepostIds = [];
    if (req.user.paidRepost.length > 0) {
      req.user.paidRepost.forEach(function(acc) {
        paidRepostIds.push(acc.userID);
      })
    }
    var query = {
      pooledChannelIDS: [],
      userID: {
        $nin: paidRepostIds
      },
      ignoredBy: {
        $ne: req.user._id
      },
      status: "pooled"
    };
    if (genre != undefined && genre != 'null') {
      query.genre = genre;
    }
    Submission.find(query).sort({
        submissionDate: 1
      })
      .populate('userID')
      .skip(skipcount)
      .limit(limitcount)
      .exec()
      .then(function(subs) {
        var i = -1;
        var next = function() {
          i++;
          if (i < subs.length) {
            var sub = subs[i].toJSON();
            sub.approvedChannels = [];
            Submission.find({
                email: sub.email
              })
              .exec()
              .then(function(oldSubs) {
                oldSubs.forEach(function(oldSub) {
                  sub.approvedChannels = sub.approvedChannels.concat(oldSub.paidChannelIDS)
                });
                resultSubs.push(sub);
                next();
              })
              .then(null, next);
          } else {
            res.send(resultSubs);
          }
        }
        next();
      })
      .then(null, next);
  }
});

router.get('/getUnacceptedSubmissions', function(req, res, next) {
  if (req.user) {
    var query = {
      channelIDS: [],
      userID: req.user._id
    };
    Submission.count(query).exec()
      .then(function(subs) {
        return res.json(subs)
      })
      .then(0, next);
  } else {
    res.json([]);
  }
});


router.get('/getGroupedSubmissions', function(req, res, next) {
  Submission.aggregate({
      $match: {
        channelIDS: [],
        userID: req.user._id
      }
    }, {
      $group: {
        _id: '$genre',
        total_count: {
          $sum: 1
        }
      }
    }).exec()
    .then(function(subs) {
      return res.json(subs)
    })
    .then(0, next);
});

router.get('/getPaidRepostAccounts', function(req, res) {
  var accounts = req.user.paidRepost;
  var results = [];
  var i = -1;
  var next = function() {
    i++;
    if (i < accounts.length) {
      var acc = accounts[i].toJSON();
      User.findOne({
        _id: acc.userID
      }, function(e, u) {
        if (u) {
          acc.user = u.soundcloud;
          results.push(acc);
        }
        next();
      });
    } else {
      res.send(results);
    }
  }
  next();
});


router.get('/getAccountsByIndex/:user_id', function(req, res) {
  var user_id = req.params.user_id;
  var results = [];
  var paidRepost = req.user.paidRepost.find(function(pr) {
    return pr.userID == user_id;
  });
  var accounts = paidRepost.toJSON();
  User.findOne({
    _id: user_id
  }, function(e, u) {
    if (u) {
      accounts.user = u.soundcloud;
      res.send(accounts);
    }
  });
});



router.put('/save', function(req, res, next) {
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    if (req.body.status == "pooled") {
      Submission.findByIdAndUpdate(req.body._id, req.body, {
          new: true
        }).exec()
        .then(function(sub) {
          res.send(sub)
        })
        .then(null, next);
    } else {
      req.body.status = "pooled";
      var poolSentDate = new Date();
      poolSentDate.setHours(poolSentDate.getHours() + 48);
      req.body.pooledSendDate = poolSentDate;
      Submission.findByIdAndUpdate(req.body._id, req.body, {
          new: true
        })
        .populate("userID")
        .exec()
        .then(function(sub) {
          User.find({
              'soundcloud.id': {
                $in: sub.channelIDS
              }
            }).exec()
            .then(function(channels) {
              var nameString = "";
              channels.forEach(function(cha, index) {
                console.log('cha', cha);
                var addString = "<a href='" + cha.soundcloud.permalinkURL + "'>" + cha.soundcloud.username + "</a>";
                if (index == channels.length - 1) {
                  if (channels.length > 1) {
                    addString = "and " + addString;
                  }
                } else {
                  addString += ", ";
                }
                nameString += addString;
              });
              var acceptEmail = {};
              if (req.user.repostCustomizeEmails && req.user.repostCustomizeEmails.length > 0) {
                acceptEmail = req.user.repostCustomizeEmails[0].acceptance;
              }
              var body = "";
              var body = acceptEmail.body;
              body = body.replace('{NAME}', sub.name);
              body = body.replace('{SONGURL}', sub.trackURL);
              body = body.replace('{EMAIL}', sub.email);
              body = body.replace('{SONGNAME}', sub.title);
              body = body.replace('{ARTIST}', sub.name);
              body = body.replace('{NAMEOFTRACK}', sub.title);
              body = body.replace('{TRACKCOVERART}', '<img src="' + sub.track_art_url + '"/>');
              body = body.replace('{SUBMITTEDCHANNEL}', sub.userID.name);
              body = body.replace('{ACCEPTEDCHANNELLIST}', nameString);
              body = body.replace('{TODAYSDATE}', new Date().toLocaleDateString());
              body = body.replace(/\n/g, "<br />");
              //var emailBody = '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url(' + 'https://artistsunlimited.com' + '/assets/images/fade-background.png) no-repeat;color:white;background-size:cover;background-position:center;"><tr><td align="left" style="padding:20px" width="50%"><a href="https://artistsunlimited.com"><img src="' + 'https://artistsunlimited.com' + '/assets/images/logo-white.png" height="45" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>'+acceptEmail.subject+'</h2></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;">'+body+'</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/pay/' + sub._id + '" style="background-color:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none;margin:30px 0;" class="btn btn-enter">Get promoted</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/login" style="color:#f5d3b5">Artist Tools</a></td></tr><tr><td style="padding:30px 30px 30px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" width="33%"><a href="https://twitter.com/latropicalmusic" style="color:#fff"><img src="' + 'https://artistsunlimited.com' + '/assets/images/email-twitter.png" alt="Twitter" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://www.facebook.com/latropicalofficial" style="color:#fff"><img src="' + 'https://artistsunlimited.com' + '/assets/images/email-facebook.png" alt="Facebook" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://soundcloud.com/latropical" style="color:#fff"><img src="' + 'https://artistsunlimited.com' + '/assets/images/email-soundcloud.png" alt="SoundColud" width="38" height="38" style="display:block" border="0"/></a></td></tr></table></td></tr></table></td></tr></table>';
              var emailBody = '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url(' + 'https://artistsunlimited.com' + '/assets/images/fade-background.png) no-repeat;color:white;background-size:cover;background-position:center;"><tr><td align="left" style="padding:20px" width="50%"><a href="https://artistsunlimited.com"><img src="' + 'https://artistsunlimited.com' + '/assets/images/logo-white.png" height="45" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>' + acceptEmail.subject + '</h2></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;">' + body + '</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/pay/' + sub._id + '" style="background-color:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none;margin:30px 0;" class="btn btn-enter">Get promoted</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/login" style="color:#f5d3b5">Artist Tools</a></td></tr></table></td></tr></table></td></tr></table>';
              sendEmail(sub.name, sub.email, "Artists Unlimited", "coayscue@artistsunlimited.com", acceptEmail.subject, emailBody);
              res.send(sub);
            }).then(null, next);
        })
        .then(null, next);
    }
  }
});

router.delete('/decline/:subID/:password', function(req, res, next) {
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    Submission.findByIdAndRemove(req.params.subID)
      .populate("userID")
      .exec()
      .then(function(sub) {
        User.find({
            'soundcloud.id': {
              $in: sub.channelIDS
            }
          }).exec()
          .then(function(channels) {
            var nameString = "";
            channels.forEach(function(cha, index) {
              console.log('cha', cha);
              var addString = "<a href='" + cha.soundcloud.permalinkURL + "'>" + cha.soundcloud.username + "</a>";
              if (index == channels.length - 1) {
                if (channels.length > 1) {
                  addString = "and " + addString;
                }
              } else {
                addString += ", ";
              }
              nameString += addString;
            });
            var declineEmail = {};
            if (req.user.repostCustomizeEmails && req.user.repostCustomizeEmails.length > 0) {
              declineEmail = req.user.repostCustomizeEmails[0].decline;
            }
            var body = declineEmail.body;
            body = body.replace('{NAME}', sub.name);
            body = body.replace('{SONGURL}', sub.trackURL);
            body = body.replace('{EMAIL}', sub.email);
            body = body.replace('{SONGNAME}', sub.title);
            body = body.replace('{ARTIST}', sub.name);
            body = body.replace('{NAMEOFTRACK}', sub.title);
            body = body.replace('{TRACKCOVERART}', '<img src="' + sub.track_art_url + '"/>');
            body = body.replace('{SUBMITTEDCHANNEL}', sub.userID.name);
            body = body.replace('{ACCEPTEDCHANNELLIST}', nameString);
            body = body.replace('{TODAYSDATE}', new Date().toLocaleDateString());
            body = body.replace(/\n/g, "<br />");
            sendEmail(sub.name, sub.email, "Artists Unlimited", "coayscue@artistsunlimited.com", declineEmail.subject, body);
            res.send(sub);
          });
      })
      .then(null, next);
  }
});

router.get('/withID/:subID', function(req, res, next) {
  Submission.findById(req.params.subID)
    .exec()
    .then(function(sub) {
      if (!sub) next(new Error('submission not found'))
      sub = sub.toJSON();
      var arrChannels = [];
      var query = {};
      if (sub.status == "pooled") {
        query = {
          'soundcloud.id': {
            $in: sub.channelIDS
          }
        }
      } else if (sub.status == "poolSent") {
        query = {
          'soundcloud.id': {
            $in: sub.pooledChannelIDS
          }
        }
      }
      User.find(query, function(e, channels) {
        if (channels && channels.length > 0) {
          var i = -1;
          var next = function() {
            i++;
            if (i < channels.length) {
              var channel = channels[i].toJSON();
              User.findOne({
                'paidRepost.userID': channel._id
              }, function(e, admin) {
                if (admin) {
                  var ch = admin.paidRepost.find(function(acc) {
                    return acc.userID.toString() == channel._id.toString()
                  });
                  if (ch) {
                    ch = ch.toJSON();
                    ch.user = channel.soundcloud;
                    arrChannels.push(ch);
                  }
                }
                next();
              });
            } else {
              sub.channels = arrChannels;
              res.send(sub);
            }
          }
          next();
        }
      });
    })
    .then(null, next);
});

router.post('/youtubeInquiry', function(req, res, next) {
  sendEmail('Zach', 'zacharia@peninsulamgmt.com', "Artists Unlimited", "coayscue@artistsunlimited.com", "Youtube Release", "Submitter's name: " + req.body.name + "<br><br>Email: " + req.body.email + "<br><br>Song URL: " + req.body.trackURL);
  res.end();
})

router.post('/sendMoreInquiry', function(req, res, next) {
  sendEmail(req.body.name, req.body.email, "Edward Sanchez", "edward@peninsulamgmt.com", 'Loved your submissions', "Hey " + req.body.name + ",<br><br>My name is Edward and I’m one of the managers here at AU. Your name appeared in our system after you submitted your track online. Normally there is not much worth looking into on their but yours has caught my eye.<br><br>I’d love to hear more of your work. We would love to potentially release one of your tracks on our network. Do you have a plan or anything in particular that you were looking for from us?<br><br>Looking forward to hearing from you.<br><br>Cheers<br><br>Edward Sanchez<br>AU Team<br>www.facebook.com/edwardlatropical");
  res.end();
})

router.delete('/ignore/:subID/:password', function(req, res, next) {
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    Submission.findByIdAndUpdate({
        _id: req.params.subID
      }, {
        $addToSet: {
          ignoredBy: req.user._id
        }
      }).exec()
      .then(function(sub) {
        res.send(sub);
      })
      .then(null, next);
  }
});

router.post('/getPayment', function(req, res, next) {
  var nameString = "Reposts on: ";
  req.body.channels.forEach(function(ch) {
    nameString += ch.user.username + " - ";
  });
  paypalCalls.makePayment(req.body.total, nameString, rootURL + "/complete", rootURL + "/pay/" + req.body.submission._id)
    .then(function(payment) {
      var submission = req.body.submission;
      if (submission.status == 'pooled') {
        submission.paidChannels = req.body.channels;
        submission.payment = payment;
      } else {
        submission.paidPooledChannels = req.body.channels;
        submission.pooledPayment = payment;
      }
      submission.discounted = req.body.discounted;
      return Submission.findByIdAndUpdate(req.body.submission._id, submission, {
        new: true
      }).exec()
    }).then(function(submission) {
      var payment = submission.status == 'pooled' ? submission.payment : submission.pooledPayment;
      var redirectLink = payment.links.find(function(link) {
        return link.rel == "approval_url";
      })
      res.send(redirectLink.href);
    })
    .then(null, next);
})

router.put('/completedPayment', function(req, res, next) {
  var responseObj = {
    events: []
  };
  var sub;
  Submission.findOne({
      $or: [{
        'payment.id': req.body.paymentId
      }, {
        'pooledPayment.id': req.body.paymentId
      }]
    })
    .then(function(submission) {
      sub = responseObj.submission = submission;
      var payment = sub.status == 'pooled' ? sub.payment : sub.pooledPayment;
      return paypalCalls.executePayment(payment.id, {
        payer_id: req.body.PayerID,
        transactions: payment.transactions
      });
    })
    .then(function(payment) {
      var promiseArray = [];
      if (sub.trackID) {
        if (sub.status == 'pooled') {
          sub.payment = payment;
          sub.paidChannels.forEach(function(channel) {
            promiseArray.push(schedulePaidRepost(channel, sub));
          });
        } else {
          sub.pooledPayment = payment;
          sub.paidPooledChannels.forEach(function(channel) {
            promiseArray.push(schedulePaidRepost(channel, sub));
          });
        }
        return Promise.all(promiseArray)
      } else {
        return [];
      }
    })
    .then(function(events) {
      sub.refundDate = new Date((new Date(sub.pooledSendDate)).getTime() + 48 * 60 * 60 * 1000);
      events.forEach(function(event) {
        var wouldBeRefundDate = new Date(new Date(event.event.day).getTime() + 4 * 60 * 60 * 1000)
        if (wouldBeRefundDate > sub.refundDate) sub.refundDate = wouldBeRefundDate;
      })
      responseObj.events = events;
      sub.save();
      res.send(responseObj);
    })
    .then(null, next);
})

function schedulePaidRepost(channel, submission) {
  return new Promise(function(fulfill, reject) {
    var today = new Date();
    scWrapper.setToken(channel.user.token);
    var reqObj = {
      method: 'DELETE',
      path: '/e1/me/track_reposts/' + submission.trackID,
      qs: {
        oauth_token: channel.user.token
      }
    };
    scWrapper.request(reqObj, function(err, data) {});
    RepostEvent.find({
        userID: channel.user.id,
        day: {
          $gt: today
        }
      })
      .exec()
      .then(function(allEvents) {
        allEvents.forEach(function(event1) {
          event1.day = new Date(event1.day);
        });
        if (channel.blockRelease) channel.blockRelease = new Date(channel.blockRelease);
        else channel.blockRelease = new Date(0);
        var continueSearch = true;
        var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        var ind = 1;
        User.findById(channel.userID).exec()
          .then(function(chan) {
            while (continueSearch) {
              var day = daysOfWeek[((new Date()).getDay() + ind) % 7];
              chan.availableSlots[day].forEach(function(hour) {
                var desiredDay = channel.blockRelease > new Date() ? channel.blockRelease : new Date();
                desiredDay.setTime(desiredDay.getTime() + ind * 24 * 60 * 60 * 1000);
                desiredDay.setHours(hour);
                if (continueSearch) {
                  var event = allEvents.find(function(eve) {
                    return eve.day.getHours() == desiredDay.getHours() && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                  });
                  if (!event) {
                    continueSearch = false;
                    var payment = submission.status == 'pooled' ? submission.payment : submission.pooledPayment;
                    var newEve = new RepostEvent({
                      type: 'paid',
                      day: desiredDay,
                      trackID: submission.trackID,
                      title: submission.title,
                      trackURL: submission.trackURL,
                      userID: channel.user.id,
                      email: submission.email,
                      name: submission.name,
                      price: channel.price,
                      saleID: payment.transactions[0].related_resources[0].sale.id
                    });
                    newEve.save()
                      .then(function(eve) {
                        eve.day = new Date(eve.day);
                        fulfill({
                          channelName: channel.user.username,
                          date: eve.day,
                          event: eve
                        });
                      })
                      .then(null, reject);
                  }
                }
              });
              ind++;
            }
          }).then(null, reject);
      }).then(null, reject);
  })
}

function calcHour(hour, destOffset) {
  var day = new Date();
  var diff = (3600000 * destOffset) + day.getTimezoneOffset() * 60000;
  var hourDiff = -diff / 3600000;
  var retHour = (hour + hourDiff) % 24;
  return retHour;
}

//reschedule repost
// router.post('/rescheduleRepost', function(req, res, next) {
//   var eventHolder;
//   console.log(req.body);
//   Event.findByIdAndRemove(req.body.id).exec()
//     .then(function(remEvent) {
//       eventHolder = remEvent;
//       return Event.find({
//         paid: true,
//         trackID: null,
//         channelID: eventHolder.channelID
//       }).exec()
//     })
//     .then(function(events) {
//       events.forEach(function(event) {
//         event.day = new Date(event.day);
//       });
//       events.sort(function(a, b) {
//         return a.day.getTime() - b.day.getTime();
//       });
//       var index = 0;
//       var today = new Date();
//       var ev = events[index];
//       while (ev && ev.day.getTime() < today.getTime()) {
//         index++;
//         ev = events[index];
//       }
//       Channel.findOne({
//           channelID: eventHolder.channelID
//         }).exec()
//         .then(function(channel) {
//           scWrapper.setToken(channel.accessToken);
//           var reqObj = {
//             method: 'GET',
//             path: '/e1/me/track_reposts/' + eventHolder.trackID,
//             qs: {
//               oauth_token: channel.accessToken
//             }
//           };
//           scWrapper.request(reqObj, function(err, data) {
//             if (err) {
//               if (!ev) {
//                 Event.find({
//                     channelID: eventHolder.channelID
//                   }).exec()
//                   .then(function(allEvents) {
//                     allEvents.forEach(function(event1) {
//                       event1.day = new Date(event1.day);
//                     });
//                     var searchHours = [24, 26, 28, 30, 32, 34];
//                     var continu = true;
//                     var ind = 1;
//                     while (continu) {
//                       searchHours.forEach(function(hour) {
//                         var actualHour = calcHour(hour, -5);
//                         var desiredDay = new Date();
//                         var releaseDay = new Date();
//                         if (channel.blockRelease) releaseDay = new Date(channel.blockRelease);
//                         if (releaseDay > desiredDay) desiredDay = releaseDay;
//                         desiredDay.setDate(desiredDay.getDate() + ind);
//                         desiredDay.setHours(actualHour);
//                         if (continu) {
//                           var event = allEvents.find(function(eve) {
//                             return eve.day.getHours() == actualHour && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
//                           });
//                           if (!event) {
//                             continu = false;
//                             eventHolder.day = desiredDay;
//                             var newEve = new Event(eventHolder);
//                             newEve.save()
//                               .then(function(eve) {
//                                 eve.day = new Date(eve.day);
//                                 sendEmail(eve.name, eve.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + eve.name + ",<br><br>We are terribly sorry for the inconvenience, but we had to reschedule your repost of <a href='" + eve.trackURL + "'>" + eve.title + "</a> on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". If your song has already been reposted, please ignore this email and we hope you enjoyed the results! We appologize the inconvenience.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
//                                 res.send(err);
//                               })
//                               .then(null, next);
//                           }
//                         }
//                       });
//                       ind++;
//                     }
//                   });
//               } else {
//                 ev.trackID = eventHolder.trackID;
//                 ev.email = eventHolder.email;
//                 ev.name = eventHolder.name;
//                 ev.title = eventHolder.title;
//                 ev.trackURL = eventHolder.trackURL;
//                 ev.save().then(function(eve) {
//                   eve.day = new Date(eve.day);
//                   sendEmail(eve.name, eve.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + eve.name + ",<br><br>We are terribly sorry for the inconvenience, but we had to reschedule your repost of <a href='" + eve.trackURL + "'>" + eve.title + "</a> on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". If your song has already been reposted, please ignore this email and we hope you enjoyed the results! We appologize the inconvenience.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
//                   res.send(err);
//                 })
//               }
//             } else {
//               res.send('Song was already reposted');
//             }
//           });
//         })
//     })
//     .then(null, next);
// });