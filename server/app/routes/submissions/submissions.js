'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
var Email = mongoose.model('Email');

// var sendMessage = require('../mandrill/sendEmail.js'); //takes: to_name, to_email, from_name, from_email, subject, message_html
var sendEmail = require("../../mandrill/sendEmail.js");
var sendInvoice = require("../../payPal/sendInvoice.js");

router.post('/', function(req, res, next) {
  var submission = new Submission(req.body);
  submission.invoiceIDS = [];
  submission.save()
    .then(function(sub) {
      var email = new Email({
        email: sub.email,
        name: sub.name
      });
      email.save()
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
  //send paypal invoice
  if (req.body.password != "letMeManage") next(new Error("Wrong password"));
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
          sendInvoice(sub);
          sendEmail(sub.name, sub.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Congratulations on your Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track to us! We checked out your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by " + nameString + ". In less than 5 minutes you will receive a series of emails with PayPal links for each channels you were approved for! This is the last step until your track will be reposted and shared by " + nameString + ". After payment you will be assigned a time slot for reposting and we will email you in less than 1 hour letting you know the exact time and day your track will be reposted. To maintain our feed’s integrity, we do not offer more than 1 repost of the approved track on any channel. With that said, if you are interested in more extensive PR packages and campaigns that guarantee anywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be hear to help you with the rest.<br><br>All the best,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/kevinlatropical<br> www.facebook.com/edwardlatropical");
          res.send(sub)
        });
    })
    .then(null, next);
});

router.delete('/decline/:subID/:password', function(req, res, next) {
  if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  Submission.findByIdAndRemove(req.params.subID).exec()
    .then(function(sub) {
      sendEmail(sub.name, sub.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at either <a href='http://etiquettenoir.co/'>Etiquette Noir</a> or <a href='http://lesol.co/'>Le Sol</a>.<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/kevinlatropical<br> www.facebook.com/edwardlatropical");
      res.send(sub);
    })
    .then(null, next);
});

router.delete('/ignore/:subID/:password', function(req, res, next) {
  if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  Submission.findByIdAndRemove(req.params.subID).exec()
    .then(function(sub) {
      res.send(sub);
    })
    .then(null, next);
});

router.post('/paid', function(req, res, next) {
  var submission;
  var chanID;
  Submission.findOne({
      invoiceIDS: req.body.resource.invoice.id
    }).exec()
    .then(function(sub) {
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
                          channelID: chanID,
                          email: submission.email,
                          name: submission.name
                        });
                        newEve.save()
                          .then(function(eve) {
                            eve.day = new Date(eve.day);
                            sendEmail(eve.name, eve.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + eve.name + ",<br><br>Thank you for completing the last step for promotion of your track! After reviewing the track and receiving your payment we have scheduled the repost on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + eve.day.toLocaleDateString() + ". Thank you for your business and if you haven’t already, check out our more extensive PR services by emailing artistsunlimited.pr@gmail.com.<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/kevinlatropical<br> www.facebook.com/edwardlatropical");
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
            ev.save().then(function(event2) {
              event2.day = new Date(event2.day);
              sendEmail(event2.name, event2.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + event2.name + ",<br><br>Thank you for completing the last step for promotion of your track! After reviewing the track and receiving your payment we have scheduled the repost on <a href='" + channel.url + "'>" + channel.displayName + "</a> for " + event2.day.toLocaleDateString() + ". Thank you for your business and if you haven’t already, check out our more extensive PR services by emailing artistsunlimited.pr@gmail.com.<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/kevinlatropical<br> www.facebook.com/edwardlatropical");
              res.send({});
            })
          }
        })
    })
    .then(null, next);
});

function calcHour(hour, destOffset) {
  var day = new Date();
  var diff = (3600000 * destOffset) + day.getTimezoneOffset() * 60000;
  var hourDiff = -diff / 3600000;
  var retHour = (hour + hourDiff) % 24;
  return retHour;
}