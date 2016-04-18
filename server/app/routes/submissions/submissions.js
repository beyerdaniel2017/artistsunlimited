'use strict';
var scConfig = global.env.SOUNDCLOUD;
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
var Email = mongoose.model('Email');
var rootURL = require('../../../env').ROOTURL;
var Promise = require('promise');
var SCR = require('soundclouder');
var scConfig = global.env.SOUNDCLOUD;
SCR.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);

var sendEmail = require("../../mandrill/sendEmail.js"); //takes: to_name, to_email, from_name, from_email, subject, message_html
var paypalCalls = require("../../payPal/paypalCalls.js");

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
  Submission.find({}).exec()
    .then(function(subs) {
      subs = subs.filter(function(sub) {
        return sub.channelIDS.length == 0;
      });
      res.send(subs);
    })
    .then(null, next);
});

router.put('/save', function(req, res, next) {
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
//          sendEmail(sub.name, sub.email, "Edward Sanchez", "coayscue@artistsunlimited.com", "Congratulations on your Submission - " + sub.title, "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track <a href='" + sub.trackURL + "'>" + sub.title + "</a> to us! We checked out your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by a couple channels on our network!<br><br>To complete and choose your promotional package, please navigate to the following link:<br><br> <a href='" + rootURL + "/pay/" + sub._id + "'>Get Reposted!</a><br><br> To maintain our feed’s integrity, we do not offer more than 1 repost of the approved track on any channel. With that said, if you are interested in more extensive PR packages and campaigns that guarantee anywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email at artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be here to help you with the rest.<br><br>All the best,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
          sendEmail(sub.name, sub.email, "Edward Sanchez", "coayscue@artistsunlimited.com", '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url('+ rootURL +'/assets/images/fade-background.png) no-repeat;color:white"><tr><td align="left" style="padding:20px" width="50%"><a href="#"><img src="'+ rootURL +'/assets/images/logo.png" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>We loved the track!</h2><p>The team listened to your '+ sub.title +' <br/>and it got accepted</p></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;font-size:24px">Hey '+ sub.name +'!</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">First of all thank you so much for submitting your track Hilversum Drie - radio edit to us! We checkedout your submission and our team was absolutely grooving with the track and we believe it’s ready tobe reposted and shared by Le Sol. All you need to do is click the button below.</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">To maintain our feed’s integrity, we do not offer more than 1 repost of the approved track per channel.With that said, if you are interested in more extensive PR packages and campaigns that guaranteeanywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budgetplease send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to yourproduction and we hope that in the future you submit your music to our network. Keep working hardand putting your heart into your art, we will be hear to help you with the rest.</td></tr><tr><td style="padding:20px 0 0 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">All the best,<br/><br/>Edward Sanchez<br/>Peninsula MGMT Team</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="'+ rootURL +'/login/" style="color:#f5d3b5">Register and use our Artist Tools</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="'+ rootURL +'/pay/'+sub._id+'" style="background:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none" class="btn btn-enter" style="margin:30px 0">Get promoted</a></td></tr><tr><td style="padding:30px 30px 30px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" width="33%"><a href="http://www.twitter.com/" style="color:#fff"><img src="'+ rootURL +'/assets/images/email-twitter.png" alt="Twitter" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="http://www.facebook.com/edwardlatropical" style="color:#fff"><img src="'+ rootURL +'/assets/images/email-facebook.png" alt="Facebook" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="http://www.twitter.com/" style="color:#fff"><img src="'+ rootURL +'/assets/images/email-soundcloud.png" alt="SoundColud" width="38" height="38" style="display:block" border="0"/></a></td></tr></table></td></tr></table></td></tr></table>');
          res.send(sub)
        });
    })
    .then(null, next);
});

router.delete('/decline/:subID/:password', function(req, res, next) {
  // if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  Submission.findByIdAndRemove(req.params.subID).exec()
    .then(function(sub) {
      sendEmail(sub.name, sub.email, "Edward Sanchez", "coayscue@artistsunlimited.co", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track <a href='" + sub.trackURL + "'>" + sub.title + "</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at either <a href='http://etiquettenoir.co/'>Etiquette Noir</a> or <a href='http://lesol.co/'>Le Sol</a>.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
      res.send(sub);
    })
    .then(null, next);
});

router.get('/withID/:subID', function(req, res, next) {
  Submission.findById(req.params.subID).exec()
    .then(function(sub) {
      if (!sub) next(new Error('submission not found'))
      res.send(sub);
    })
    .then(null, next);
});

router.delete('/ignore/:subID/:password', function(req, res, next) {
  Submission.findByIdAndRemove(req.params.subID).exec()
    .then(function(sub) {
      res.send(sub);
    })
    .then(null, next);
});

router.post('/paid', function(req, res, next) {
  var submission;
  var chanID;
  var supportifyChunk = "";
  Submission.findOne({
      invoiceIDS: req.body.resource.invoice.id
    }).exec()
    .then(function(sub) {

      var index = sub.channelIDS.indexOf(147045855); //supportify
      if (index == -1) {
        sub.channelIDS.push(147045855);
        sendInvoice(sub, 147045855);
        supportifyChunk = "Since we’ve approved you for a repost you can also get featured with our partners at <a href='https://soundcloud.com/supportify'>Supportify</a>. If you are interested in being featured there, please pay the invoice for Supportify that we are sending you. "
      }
      submission = sub;
      var index = sub.invoiceIDS.indexOf(req.body.resource.invoice.id);
      chanID = sub.channelIDS[index];
      return Event.find({
        paid: true,
        trackID: null,
        channelID: chanID
      }).exec()
    })
    .then(function(events) {
      events.forEach(function(event) {
        event.day = new Date(event.day);
      });
      events.sort(function(a, b) {
        return a.day.getTime() - b.day.getTime();
      });
      var index = 0;
      var today = new Date();
      var ev = events[index];
      while (ev && ev.day.getTime() < today.getTime()) {
        index++;
        ev = events[index];
      }
      Channel.findOne({
          channelID: chanID
        }).exec()
        .then(function(channel) {
          if (!ev) {
            Event.find({
                channelID: chanID
              }).exec()
              .then(function(allEvents) {
                allEvents.forEach(function(event1) {
                  event1.day = new Date(event1.day);
                });
                var searchHours = [27, 30, 33, 46, 48];
                var continu = true;
                var ind = 1;
                while (continu) {
                  searchHours.forEach(function(hour) {
                    var actualHour = calcHour(hour, -5);
                    var desiredDay = new Date();
                    var releaseDay = new Date();
                    if (channel.blockRelease) releaseDay = new Date(channel.blockRelease);
                    if (releaseDay > desiredDay) desiredDay = releaseDay;
                    desiredDay.setDate(desiredDay.getDate() + ind);
                    desiredDay.setHours(actualHour);
                    if (continu) {
                      var event = allEvents.find(function(eve) {
                        return eve.day.getHours() == actualHour && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                      });
                      if (!event) {
                        continu = false;
                        var newEve = new Event({
                          paid: true,
                          day: desiredDay,
                          trackID: submission.trackID,
                          title: submission.title,
                          trackURL: submission.trackURL,
                          channelID: chanID,
                          email: submission.email,
                          name: submission.name
                        });
                        newEve.save()
                          .then(function(eve) {
                            eve.day = new Date(eve.day);
                            sendEmail(eve.name, eve.email, "Edward Sanchez", "coayscue@artistsunlimited.co", "Music Submission", "Hey " + eve.name + ",<br><br>Thank you for completing the last step for promotion of your track <a href='" + eve.trackURL + "'>" + eve.title + "</a>! After reviewing the track and receiving your payment we have scheduled the repost on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". " + supportifyChunk + "Thank you for your business and if you haven’t already, check out our more extensive PR services by emailing artistsunlimited.pr@gmail.com.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
                            res.send({});
                          })
                          .then(null, next);
                      }
                    }
                  });
                  ind++;
                }
              });
          } else {
            ev.trackID = submission.trackID;
            ev.email = submission.email;
            ev.name = submission.name;
            ev.title = submission.title;
            ev.trackURL = submission.trackURL;
            ev.save().then(function(eve) {
              eve.day = new Date(eve.day);
              sendEmail(eve.name, eve.email, "Edward Sanchez", "coayscue@artistsunlimited.co", "Music Submission", "Hey " + eve.name + ",<br><br>Thank you for completing the last step for promotion of your track<a href='" + eve.trackURL + "'>" + eve.title + "</a>! After reviewing the track and receiving your payment we have scheduled the repost on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". " + supportifyChunk + "Thank you for your business and if you haven’t already, check out our more extensive PR services by emailing artistsunlimited.pr@gmail.com.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
              res.send(eve);
            })
          }
        })
    })
    .then(null, next);
});

//reschedule repost
router.post('/rescheduleRepost', function(req, res, next) {
  var eventHolder;
  console.log(req.body);
  Event.findByIdAndRemove(req.body.id).exec()
    .then(function(remEvent) {
      eventHolder = remEvent;
      return Event.find({
        paid: true,
        trackID: null,
        channelID: eventHolder.channelID
      }).exec()
    })
    .then(function(events) {
      events.forEach(function(event) {
        event.day = new Date(event.day);
      });
      events.sort(function(a, b) {
        return a.day.getTime() - b.day.getTime();
      });
      var index = 0;
      var today = new Date();
      var ev = events[index];
      while (ev && ev.day.getTime() < today.getTime()) {
        index++;
        ev = events[index];
      }
      Channel.findOne({
          channelID: eventHolder.channelID
        }).exec()
        .then(function(channel) {
          SCR.get('/e1/me/track_reposts/' + eventHolder.trackID, channel.accessToken, function(err, data) {
            if (err) {
              if (!ev) {
                Event.find({
                    channelID: eventHolder.channelID
                  }).exec()
                  .then(function(allEvents) {
                    allEvents.forEach(function(event1) {
                      event1.day = new Date(event1.day);
                    });
                    var searchHours = [27, 30, 33, 35, 37, 39, 41, 43, 46, 48];
                    var continu = true;
                    var ind = 1;
                    while (continu) {
                      searchHours.forEach(function(hour) {
                        var actualHour = calcHour(hour, -5);
                        var desiredDay = new Date();
                        desiredDay.setDate(desiredDay.getDate() + ind);
                        desiredDay.setHours(actualHour);
                        if (continu) {
                          var event = allEvents.find(function(eve) {
                            return eve.day.getHours() == actualHour && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                          });
                          if (!event) {
                            continu = false;
                            eventHolder._id = null;
                            eventHolder.__v = null;
                            eventHolder.day = desiredDay;
                            var newEve = new Event(eventHolder);
                            newEve.save()
                              .then(function(eve) {
                                eve.day = new Date(eve.day);
                                sendEmail(eve.name, eve.email, "Edward Sanchez", "coayscue@artistsunlimited.co", "Music Submission", "Hey " + eve.name + ",<br><br>We are terribly sorry for the inconvenience, but we had to reschedule your repost of <a href='" + eve.trackURL + "'>" + eve.title + "</a> on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". If your song has already been reposted, please ignore this email and we hope you enjoyed the results! We appologize the inconvenience.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
                                res.send(err);
                              })
                              .then(null, next);
                          }
                        }
                      });
                      ind++;
                    }
                  });
              } else {
                ev.trackID = eventHolder.trackID;
                ev.email = eventHolder.email;
                ev.name = eventHolder.name;
                ev.title = eventHolder.title;
                ev.trackURL = eventHolder.trackURL;
                ev.save().then(function(eve) {
                  eve.day = new Date(eve.day);
                  sendEmail(eve.name, eve.email, "Edward Sanchez", "coayscue@artistsunlimited.co", "Music Submission", "Hey " + eve.name + ",<br><br>We are terribly sorry for the inconvenience, but we had to reschedule your repost of <a href='" + eve.trackURL + "'>" + eve.title + "</a> on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". If your song has already been reposted, please ignore this email and we hope you enjoyed the results! We appologize the inconvenience.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
                  res.send(err);
                })
              }
            } else {
              res.send('Song was already reposted');
            }
          });
        })
    })
    .then(null, next);
});

router.post('/getPayment', function(req, res, next) {
  var total = 0;
  Channel.find({
      channelID: {
        $in: req.body.channels
      }
    }).then(function(channels) {
      channels.forEach(function(ch) {
        total += ch.price;
      });
      if (req.body.discount) total = Math.floor(total * 0.9);
      return paypalCalls.makePayment(total, req.body.submission, channels);
    })
    .then(function(payment) {
      var submission = req.body.submission;
      submission.paidChannelIDS = req.body.channels;
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
      var promiseArray = [];
      submission.paidChannelIDS.forEach(function(chanID) {
        promiseArray.push(schedulePaidRepost(chanID, submission));
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
    Event.find({
        paid: true,
        trackID: null,
        channelID: chanID
      }).exec()
      .then(function(events) {
        events.forEach(function(event) {
          event.day = new Date(event.day);
        });
        events.sort(function(a, b) {
          return a.day.getTime() - b.day.getTime();
        });
        var index = 0;
        var today = new Date();
        var ev = events[index];
        while (ev && ev.day.getTime() < today.getTime()) {
          index++;
          ev = events[index];
        }
        Channel.findOne({
            channelID: chanID
          }).exec()
          .then(function(channel) {
            if (!ev) {
              Event.find({
                  channelID: chanID
                }).exec()
                .then(function(allEvents) {
                  allEvents.forEach(function(event1) {
                    event1.day = new Date(event1.day);
                  });
                  var searchHours = [27, 30, 33, 46, 48];
                  var continu = true;
                  var ind = 1;
                  while (continu) {
                    searchHours.forEach(function(hour) {
                      var actualHour = calcHour(hour, -5);
                      var desiredDay = new Date();
                      var releaseDay = new Date();
                      if (channel.blockRelease) releaseDay = new Date(channel.blockRelease);
                      if (releaseDay > desiredDay) desiredDay = releaseDay;
                      desiredDay.setDate(desiredDay.getDate() + ind);
                      desiredDay.setHours(actualHour);
                      if (continu) {
                        var event = allEvents.find(function(eve) {
                          return eve.day.getHours() == actualHour && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                        });
                        if (!event) {
                          continu = false;
                          var newEve = new Event({
                            paid: true,
                            day: desiredDay,
                            trackID: submission.trackID,
                            title: submission.title,
                            trackURL: submission.trackURL,
                            channelID: chanID,
                            email: submission.email,
                            name: submission.name
                          });
                          newEve.save()
                            .then(function(eve) {
                              eve.day = new Date(eve.day);
                              eve.channelID = channel.displayName;
                              fulfill({
                                channelName: channel.displayName,
                                date: eve.day
                              });
                            })
                            .then(null, reject);
                        }
                      }
                    });
                    ind++;
                  }
                });
            } else {
              ev.trackID = submission.trackID;
              ev.email = submission.email;
              ev.name = submission.name;
              ev.title = submission.title;
              ev.trackURL = submission.trackURL;
              ev.save()
                .then(function(eve) {
                  eve.day = new Date(eve.day);
                  Channel.findOne({
                      channelID: eve.channelID
                    })
                    .then(function(ch) {
                      eve.channelID = ch.displayName;
                      fulfill({
                        channelName: ch.displayName,
                        date: eve.day
                      });
                    })
                    .then(null, reject);

                }).then(null, reject);
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