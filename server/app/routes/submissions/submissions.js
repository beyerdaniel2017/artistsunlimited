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
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    Submission.find({
        channelIDS: []
      }).sort({
        submissionDate: -1
      }).exec()
      .then(function(subs) {
        subs = subs.filter(function(sub) {
          return sub.channelIDS.length == 0;
        });
        res.send(subs);
      })
      .then(null, next);
  }
});

router.put('/save', function(req, res, next) {
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    Submission.findByIdAndUpdate(req.body._id, req.body, {
        new: true
      }).exec()
      .then(function(sub) {
        Channel.find({}).exec()
          .then(function(channels) {
            var chans = channels.filter(function(cha) {
              return sub.channelIDS.indexOf(cha.channelID) != -1;
            });
            var nameString = "";
            chans.forEach(function(cha, index) {
              var addString = "<a href='" + cha.url + "'>" + cha.displayName + "</a>";
              if (index == chans.length - 1) {
                if (chans.length > 1) {
                  addString = "and " + addString;
                }
              } else {
                addString += ", ";
              }
              nameString += addString;
            });
            sendEmail(sub.name, sub.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Congratulations on your Submission - " + sub.title, '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url(' + 'https://artistsunlimited.co' + '/assets/images/fade-background.png) no-repeat;color:white;background-size:cover;background-position:center;"><tr><td align="left" style="padding:20px" width="50%"><a href="https://artistsunlimited.co"><img src="' + 'https://artistsunlimited.co' + '/assets/images/logo-white.png" height="45" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>We loved the track!</h2><p>The team listened to your track ' + sub.title + ' <br/>and it got accepted for promotion.</p></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;font-size:24px">Hey ' + sub.name + '!</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">First of all thank you so much for submitting your track ' + sub.title + ' to us! We checkedout your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by channels on our network. All you need to do is click the button below.</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">To maintain our feed’s integrity, we do not offer more than one repost of the approved track per channel. With that said, if you are interested in more extensive PR packages and campaigns that guarante eanywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be here to help you with the rest.</td></tr><tr><td style="padding:20px 0 0 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">All the best,<br/><br/>Edward Sanchez<br/>Peninsula MGMT Team<br>www.facebook.com/edwardlatropical</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/pay/' + sub._id + '" style="background-color:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none;margin:30px 0;" class="btn btn-enter">Get promoted</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/login" style="color:#f5d3b5">Artist Tools</a></td></tr><tr><td style="padding:30px 30px 30px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" width="33%"><a href="https://twitter.com/latropicalmusic" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-twitter.png" alt="Twitter" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://www.facebook.com/latropicalofficial" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-facebook.png" alt="Facebook" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://soundcloud.com/latropical" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-soundcloud.png" alt="SoundColud" width="38" height="38" style="display:block" border="0"/></a></td></tr></table></td></tr></table></td></tr></table>');
            res.send(sub);
          });
      })
      .then(null, next);
  }
});

router.delete('/decline/:subID/:password', function(req, res, next) {
  // if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  if (!req.user.role == 'admin') {
    next({
      message: 'Forbidden',
      status: 403
    })
  } else {
    Submission.findByIdAndRemove(req.params.subID).exec()
      .then(function(sub) {
        sendEmail(sub.name, sub.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track <a href='" + sub.trackURL + "'>" + sub.title + "</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at <a href='https://artistsunlimited.co/submit'>Artists Unlimited</a>.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
        res.send(sub);
      })
      .then(null, next);
  }
});

router.get('/withID/:subID', function(req, res, next) {
  Submission.findById(req.params.subID).exec()
    .then(function(sub) {
      if (!sub) next(new Error('submission not found'))
      res.send(sub);
    })
    .then(null, next);
});

router.post('/youtubeInquiry', function(req, res, next) {
  sendEmail('Zach', 'zacharia@peninsulamgmt.com', "Artists Unlimited", "coayscue@artistsunlimited.co", "Youtube Release", "Submitter's name: " + req.body.name + "<br><br>Email: " + req.body.email + "<br><br>Song URL: " + req.body.trackURL);
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
    Submission.findByIdAndRemove(req.params.subID).exec()
      .then(function(sub) {
        res.send(sub);
      })
      .then(null, next);
  }
});

router.post('/getPayment', function(req, res, next) {
  paypalCalls.makePayment(req.body.total, req.body.submission, req.body.channels)
    .then(function(payment) {
      var submission = req.body.submission;
      submission.paidChannelIDS = req.body.channels.map(function(ch) {
        return ch.soundcloud.id;
      });
      submission.paid = false;
      submission.payment = payment;
      submission.discounted = req.body.discounted;
      return Submission.findByIdAndUpdate(req.body.submission._id, submission, {
        new: true
      }).exec()
    }).then(function(submission) {
      var redirectLink = submission.payment.links.find(function(link) {
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
      'payment.id': req.body.paymentId
    })
    .then(function(submission) {
      sub = responseObj.submission = submission;
      return paypalCalls.executePayment(submission.payment.id, {
        payer_id: req.body.PayerID,
        transactions: submission.payment.transactions
      });
    })
    .then(function(payment) {
      sub.payment = payment;
      var promiseArray = [];
      sub.paidChannelIDS.forEach(function(chanID) {
        promiseArray.push(schedulePaidRepost(chanID, sub));
      });
      return Promise.all(promiseArray)
    })
    .then(function(events) {
      responseObj.events = events;
      sub.paid = true;
      sub.save();
      res.send(responseObj);
    })
    .then(null, next);
})

function schedulePaidRepost(chanID, submission) {
  return new Promise(function(fulfill, reject) {
    var today = new Date();
    User.findOne({
        'soundcloud.id': chanID
      }).exec()
      .then(function(channel) {
        scWrapper.setToken(channel.soundcloud.token);
        var reqObj = {
          method: 'DELETE',
          path: '/e1/me/track_reposts/' + submission.trackID,
          qs: {
            oauth_token: channel.soundcloud.token
          }
        };
        scWrapper.request(reqObj, function(err, data) {});
        RepostEvent.find({
            userID: chanID,
            day: {
              $gt: today
            }
          }).exec()
          .then(function(allEvents) {
            allEvents.forEach(function(event1) {
              event1.day = new Date(event1.day);
            });
            var searchHours = [24, 28, 32, 36, 40, 44];
            var continueSearch = true;
            var ind = 1;
            while (continueSearch) {
              searchHours.forEach(function(hour) {
                var actualHour = calcHour(hour, -5);
                var desiredDay = new Date();
                desiredDay.setDate(desiredDay.getDate() + ind);
                desiredDay.setHours(actualHour);
                if (continueSearch) {
                  var event = allEvents.find(function(eve) {
                    return eve.day.getHours() == desiredDay.getHours() && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                  });
                  if (!event) {
                    continueSearch = false;
                    var newEve = new RepostEvent({
                      type: 'paid',
                      day: desiredDay,
                      trackID: submission.trackID,
                      title: submission.title,
                      trackURL: submission.trackURL,
                      userID: chanID,
                      email: submission.email,
                      name: submission.name,
                    });
                    newEve.save()
                      .then(function(eve) {
                        eve.day = new Date(eve.day);
                        User.findOne({
                            'soundcloud.id': chanID
                          }).exec()
                          .then(function(user) {
                            fulfill({
                              channelName: user.soundcloud.username,
                              date: eve.day
                            });
                          }).then(null, reject);
                      })
                      .then(null, reject);
                  }
                }
              });
              ind++;
            }
          });
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