'use strict';
var scConfig = global.env.SOUNDCLOUD;
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var Email = mongoose.model('Email');
var rootURL = require('../../../env').ROOTURL;
var Promise = require('promise');
var scConfig = global.env.SOUNDCLOUD;
var sendEmail = require("../../mandrill/sendEmail.js"); //takes: to_name, to_email, from_name, from_email, subject, message_html
var paypalCalls = require("../../payPal/paypalCalls.js");
var scheduleRepost = require("../../scheduleRepost/scheduleRepost.js");
var scWrapper = require("../../SCWrapper/SCWrapper.js");
scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.redirectURL
});

router.post('/', function(req, res, next) {
  User.findOne({
      'paidRepost.userID': req.body.userID
    })
    .then(function(adminUser) {
      if (adminUser) {
        var paidRepostIds = [];
        if (adminUser.paidRepost.length > 0) {
          adminUser.paidRepost.forEach(function(acc) {
            paidRepostIds.push(acc.userID);
          })
        }
        return Submission.findOne({
          trackID: req.body.trackID,
          userID: {
            $in: paidRepostIds
          },
          submissionDate: {
            $gt: new Date().getTime() - 48 * 3600000
          }
        })
      } else {
        throw new Error("Could not find admin user.")
      }
    }).then(function(sub) {
      if (sub) {
        throw new Error("You have already submitted this track to this merchant in the last 48 hours. Please wait to hear back.")
      } else {
        var submission = new Submission(req.body);
        submission.submissionDate = new Date();
        return submission.save()
      }
    }).then(function(sub) {
      res.send(sub);
    }).then(null, next);
});

router.post('/pool', function(req, res, next) {
  Submission.findOne({
    trackID: req.body.trackID,
    poolSendDate: {
      $gt: new Date().getTime() - 48 * 3600000
    }
  }).then(function(sub) {
    if (sub) {
      throw new Error("This track is already submitted to all merchants and is being reviewed.")
    } else {
      console.log(req.body);
      var submission = new Submission(req.body);
      submission.submissionDate = new Date();
      submission.status = "pooled";
      submission.pooledSendDate = new Date((new Date()).getTime() + 48 * 3600000);
      return submission.save()
    }
  }).then(function(sub) {
    res.send(sub);
  }).then(null, next);
})

router.get('/unaccepted', function(req, res, next) {
  if (!req.user.role == 'admin' || !req.user.role == 'superadmin') {
    next(new Error('Unauthoirized'));
    return;
  } else {
    var resultSubs = [];
    var skipcount = parseInt(req.query.skip);
    var limitcount = parseInt(req.query.limit);
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
      ignoredBy: {
        $ne: req.user._id.toJSON()
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
      .then(function(subs) {
        var i = -1;
        var cont = function() {
          i++;
          if (i < subs.length) {
            var sub = subs[i].toJSON();
            sub.approvedChannels = [];
            Submission.find({
                email: sub.email
              })
              .then(function(oldSubs) {
                oldSubs.forEach(function(oldSub) {
                  oldSub.paidChannels.forEach(function(pc) {
                    sub.approvedChannels.push(pc.user.id)
                  })
                });
                resultSubs.push(sub);
                cont();
              })
              .then(null, next);
          } else {
            res.send(resultSubs);
          }
        }
        cont();
      })
      .then(null, next);
  }
});

router.get('/getMarketPlaceSubmission', function(req, res, next) {
  if (!req.user.role == 'admin' || !req.user.role == 'superadmin') {
    next(new Error('Unauthoirized'));
    return;
  } else {
    var resultSubs = [];
    var skipcount = parseInt(req.query.skip);
    var limitcount = parseInt(req.query.limit);
    var genre = req.query.genre ? req.query.genre : undefined;
    var paidRepostIds = [];
    if (req.user.paidRepost.length > 0) {
      req.user.paidRepost.forEach(function(acc) {
        paidRepostIds.push(acc.userID);
      })
    }
    var query = {
      pooledSendDate: {
        $gt: new Date()
      },
      ignoredBy: {
        $ne: req.user._id.toJSON()
      },
      status: "pooled"
    };
    console.log(query);
    if (genre != undefined && genre != 'null') {
      query.genre = genre;
    }
    Submission.find(query).sort({
        submissionDate: 1
      })
      .populate('userID')
      .skip(skipcount)
      .limit(limitcount)
      .then(function(subs) {
        console.log(subs);
        var i = -1;
        var cont = function() {
          i++;
          if (i < subs.length) {
            var sub = subs[i].toJSON();
            sub.approvedChannels = [];
            Submission.find({
                email: sub.email
              })
              .then(function(oldSubs) {
                oldSubs.forEach(function(oldSub) {
                  oldSub.paidChannels.forEach(function(chan) {
                    sub.approvedChannels.push(chan.user.id);
                  })
                  oldSub.paidPooledChannels.forEach(function(chan) {
                    sub.approvedChannels.push(chan.user.id);
                  })
                });
                resultSubs.push(sub);
                cont();
              })
              .then(null, next);
          } else {
            res.send(resultSubs);
          }
        }
        cont();
      })
      .then(null, next);
  }
});

router.get('/counts', function(req, res, next) {
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
    ignoredBy: {
      $ne: req.user._id.toJSON()
    },
    status: "submitted"
  };
  var resObj = {};
  Submission.count(query, function(err, count) {
    if (!err) {
      resObj.regularCount = count;
      var paidRepostIds = [];
      if (req.user.paidRepost.length > 0) {
        req.user.paidRepost.forEach(function(acc) {
          paidRepostIds.push(acc.userID);
        })
      }
      var query = {
        pooledSendDate: {
          $gt: new Date()
        },
        ignoredBy: {
          $ne: req.user._id.toJSON()
        },
        status: "pooled"
      }
      Submission.count(query, function(err, countMarket) {
        if (!err) {
          resObj.marketCount = countMarket;
          res.send(resObj);
        } else {
          next(err);
        }
      })
    } else {
      next(err);
    }
  })
})

router.get('/getUnacceptedSubmissions', function(req, res, next) {
  if (req.user) {
    var query = {
      channelIDS: [],
      userID: req.user._id,
      ignoredBy: {
        $ne: req.user._id.toJSON()
      }
    };
    Submission.count(query)
      .then(function(subs) {
        return res.json(subs)
      })
      .then(0, next);
  } else {
    res.json([]);
  }
});


router.get('/getGroupedSubmissions', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
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
    })
    .then(function(subs) {
      return res.json(subs)
    })
    .then(0, next);
});

router.get('/getPaidRepostAccounts', function(req, res) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
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
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
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
  if (!req.user || req.user.role != 'admin') {
    next(new Error('Unauthorized'));
    return;
  } else {
    if (req.body.status == "pooled") {
      req.body.ignoredBy.push(req.user._id.toJSON());
      Submission.findByIdAndUpdate(req.body._id, req.body, {
          new: true
        })
        .then(function(sub) {
          res.send(sub)
        })
        .then(null, next);
    } else {
      req.body.status = "pooled";
      if (req.user.repostSettings.poolOn) req.body.pooledSendDate = new Date((new Date()).getTime() + 48 * 3600000);
      else req.body.pooledSendDate = new Date(0);
      req.body.ignoredBy = [req.user._id.toJSON()];
      Submission.findByIdAndUpdate(req.body._id, req.body, {
          new: true
        })
        .populate("userID")
        .then(function(sub) {
          User.find({
              'soundcloud.id': {
                $in: sub.channelIDS
              }
            })
            .then(function(channels) {
              var nameString = "";
              var nameStringWithLink = "";
              channels.forEach(function(cha, index) {
                var addString = cha.soundcloud.username;
                var addStringWithLink = "<a href='" + cha.soundcloud.permalinkURL + "'>" + cha.soundcloud.username + "</a>";
                if (index == channels.length - 1) {
                  if (channels.length > 1) {
                    addString = "and " + addString;
                    addStringWithLink = "and " + addStringWithLink;
                  }
                } else {
                  addStringWithLink += ", ";
                  addString += ", ";
                }
                nameStringWithLink += addStringWithLink;
                nameString += addString;
              });
              sub.nameString = nameString;
              sub.nameStringWithLink = nameStringWithLink;
              var acceptEmail = {};
              if (req.user.repostCustomizeEmails && req.user.repostCustomizeEmails.length > 0) {
                acceptEmail = req.user.repostCustomizeEmails[0].acceptance;
              }
              var body = formatForEmail(acceptEmail.body, sub);
              var subject = formatForEmail(acceptEmail.subject, sub);
              var emailBody = '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url(' + 'https://artistsunlimited.com' + '/assets/images/fade-background.png) no-repeat;color:white;background-size:cover;background-position:center;"><tr><td align="left" style="padding:20px" width="50%"><a href="https://artistsunlimited.com"><img src="' + 'https://artistsunlimited.com' + '/assets/images/logo-white.png" height="45" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>' + 'Your Submission Was Accepted' + '</h2></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;">' + body + '</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/pay/' + sub._id + '" style="background-color:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none;margin:30px 0;" class="btn btn-enter">Get promoted</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/login" style="color:#f5d3b5">Artist Tools</a></td></tr></table></td></tr></table></td></tr></table>';
              sendEmail(sub.name, sub.email, "Artists Unlimited", "coayscue@artistsunlimited.com", subject, emailBody);
              res.send(sub);
            }).then(null, next);
        })
        .then(null, next);
    }
  }
});

function formatForEmail(item, sub) {
  return item.replace('{TRACK_TITLE_WITH_LINK}', '<a href="' + sub.trackURL + '">' + sub.title + '</a>').replace('{TRACK_TITLE}', sub.title).replace('{SUBMITTERS_EMAIL}', sub.email).replace('{SUBMITTERS_NAME}', sub.name).replace('{TRACK_ARTIST_WITH_LINK}', '<a href="' + sub.trackArtistURL + '">' + sub.trackArtist + '</a>').replace('{TRACK_ARTIST}', sub.trackArtist).replace('{SUBMITTED_TO_ACCOUNT_NAME}', sub.userID.soundcloud.username).replace('{SUBMITTED_ACCOUNT_NAME_WITH_LINK}', '<a href="' + sub.userID.soundcloud.permalinkURL + '">' + sub.userID.soundcloud.username + '</a>').replace('{TRACK_ARTWORK}', '<img src="' + sub.artworkURL + '" style="width:200px; height: 200px"/>').replace('{ACCEPTED_CHANNEL_LIST}', sub.nameString).replace('{ACCEPTED_CHANNEL_LIST_WITH_LINK}', sub.nameStringWithLink).replace('{TODAYSDATE}', new Date().toLocaleDateString()).replace(/\n/g, "<br>");
}

router.delete('/decline/:subID/:password', function(req, res, next) {
  if (!req.user.role == 'admin') {
    next(new Error('Unauthorized'));
    return;
  } else {
    Submission.findByIdAndRemove(req.params.subID)
      .populate("userID")
      .then(function(sub) {
        User.find({
            'soundcloud.id': {
              $in: sub.channelIDS
            }
          })
          .then(function(channels) {
            var declineEmail = {};
            if (req.user.repostCustomizeEmails && req.user.repostCustomizeEmails.length > 0) {
              declineEmail = req.user.repostCustomizeEmails[0].decline;
            }
            sub.nameStringWithLink = ""
            sub.nameString = "";
            var body = formatForEmail(declineEmail.body, sub);
            var subject = formatForEmail(declineEmail.subject, sub);
            sendEmail(sub.name, sub.email, "Artists Unlimited", "coayscue@artistsunlimited.com", subject, body);
            res.send(sub);
          });
      })
      .then(null, next);
  }
});

router.get('/withID/:subID', function(req, res, next) {
  Submission.findById(req.params.subID)
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
      })
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
      })
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
      if (submission) {
        sub = responseObj.submission = submission;
        var payment = sub.status == 'pooled' ? sub.payment : sub.pooledPayment;
        return paypalCalls.executePayment(payment.id, {
          payer_id: req.body.PayerID,
          transactions: payment.transactions
        });
      } else next('submission not found');
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
      sub.save();
      User.findOne({
        'soundcloud.id': events[0].event.userID
      }).then(function(user) {
        res.json({
          username: user.soundcloud.username,
          title: events[0].event.pseudoname
        });
      }).then(null, next)
    })
    .then(null, next);
})

function schedulePaidRepost(channel, submission) {
  return new Promise(function(fulfill, reject) {
    scWrapper.setToken(channel.user.token);
    var reqObj = {
      method: 'DELETE',
      path: '/e1/me/track_reposts/' + submission.trackID,
      qs: {
        oauth_token: channel.user.token
      }
    };
    scWrapper.request(reqObj, function(err, data) {});
    var payment = submission.status == 'pooled' ? submission.payment : submission.pooledPayment;
    User.findById(channel.userID)
      .then(function(user) {
        var eventDetails = {
          type: 'paid',
          trackID: submission.trackID,
          title: submission.title,
          trackURL: submission.trackURL,
          userID: channel.user.id,
          email: submission.email,
          name: submission.name,
          price: channel.price,
          saleID: payment.transactions[0].related_resources[0].sale.id,
        }
        if (user.repostSettings && user.repostSettings.paid && user.repostSettings.paid.like) eventDetails.like = true;
        if (user.repostSettings && user.repostSettings.paid && user.repostSettings.paid.comment) eventDetails.comment = user.repostSettings.paid.comments[Math.floor(Math.random() * user.repostSettings.paid.comments.length)];
        scheduleRepost(eventDetails, new Date())
          .then(function(event) {
            fulfill({
              channelName: channel.user.username,
              date: event.day,
              event: event
            });
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

router.get('/getSoldReposts', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var newObj = {};
  var accounts = req.user.paidRepost;
  var results = [];
  var i = -1;
  var next = function() {
    i++;
    if (i < accounts.length) {
      var acc = accounts[i];
      User.findOne({
        _id: acc.userID
      }, function(e, user) {
        if (user) {

          RepostEvent.find({
            userID: user.soundcloud.id,
            type: "paid"
          }, function(err, data) {
            for (var i = 0; i < data.length; i++) {
              var newObj = {
                username: user.name,
                data: data[i]
              }
              results.push(newObj);
            }
            next();
          })
        } else {
          next();
        }
      });
    } else {
      res.send(results);
    }
  }
  next();
});
router.get('/getEarnings', function(req, res, next) {
  if (!req.user) {
    next(new Error('Unauthorized'));
    return;
  }
  var results = [];
  var i = -1;
  var accounts = req.user.paidRepost;
  var next = function() {
    i++;
    if (i < accounts.length) {
      var acc = accounts[i];
      User.findOne({
        _id: acc.userID
      }, function(e, user) {
        if (user) {
          RepostEvent.find({
            userID: user.soundcloud.id,
            type: "paid",
          }, function(err, data) {
            var count = 0;
            for (var i = 0; i < data.length; i++) {
              count = count + data[i].price;
            }
            Submission.find({
              'userID': user._id
            }, function(err, item) {
              var channelIDS = 0;
              var pooledChannelIDS = 0;
              var paidChannels = 0;
              var paidPooledChannels = 0;
              for (var j = 0; j < item.length; j++) {
                channelIDS += item[j].channelIDS.length;
                pooledChannelIDS += item[j].pooledChannelIDS.length;
                paidChannels += item[j].paidChannels.length;
                paidPooledChannels += item[j].paidPooledChannels.length;
              }
              var percentage = (paidPooledChannels + paidChannels) / (channelIDS + pooledChannelIDS);
              var newObj = {
                username: user.name,
                amount: count,
                submissions: item.length,
                paymentCount: data.length,
                percentage: percentage
              }
              results.push(newObj);
              next();
            });
          })
        } else {
          next();
        }
      });
    } else {
      res.send(results);
    }
  }
  next();
});