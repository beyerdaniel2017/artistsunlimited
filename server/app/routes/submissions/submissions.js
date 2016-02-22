'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var Event = mongoose.model('Event');
// var sendMessage = require('../mandrill/sendEmail.js'); //takes: to_name, to_email, from_name, from_email, subject, message_html
var sendEmail = require("../../mandrill/sendEmail.js");
var sendInvoice = require("../../payPal/sendInvoice.js");

router.post('/', function(req, res, next) {
  var submission = new Submission(req.body);
  submission.save()
    .then(function(sub) {
      res.send('Submitted');
    })
    .then(null, next);
});

router.get('/', function(req, res, next) {
  Submission.find({}).exec()
    .then(function(subs) {
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
          console.log(chans);
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
          sendEmail(sub.name, sub.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Congratulations on your Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track to us! We checked out your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by " + nameString + ". Attached you will find the paypal links for each channel you were approved for. This is the last step until your track will be reposted and shared by " + nameString + ". After payment you will be assigned a time slot for reposting and we will email you in less than 1 hour letting you know the exact time and day your track will be reposted. To maintain our feed’s integrity, we do not offer more than 1 repost of the approved track on any channel. With that said, if you are interested in more extensive PR packages and campaigns that guarantee anywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be hear to help you with the rest.<br><br>All the best,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
        });
      res.send(sub);
    })
    .then(null, next);
});

router.delete('/decline/:subID/:password', function(req, res, next) {
  if (req.params.password != "letMeManage") next(new Error("Wrong password"));
  Submission.findByIdAndRemove(req.params.subID).exec()
    .then(function(sub) {
      sendEmail(sub.name, sub.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at either <a href='http://etiquettenoir.co/'>Etiquette Noir</a> or <a href='http://lesol.co/'>Le Sol</a>.<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
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
      console.log(sub);
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
      console.log(events);
      console.log(ev);
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
                //find the next open spot starting tomorrow: 10:00PM — 12:00AM — 3:00AM — 6:00AM — 9:00AM
                allEvents.forEach(function(ev) {
                  ev.day = new Date(ev.day);
                });
                console.log(allEvents);
                var searchHours = [0, 3, 6, 9, 22];
                var continu = true;
                var ind = 1;
                while (continu) {
                  var desiredDay = new Date();
                  desiredDay.setDate(desiredDay.getDate() + ind);
                  searchHours.forEach(function(hour) {
                    if (continu) {
                      var event = allEvents.find(function(eve) {
                        return eve.day.getHours() == hour && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                      });
                      if (!event) {
                        continu = false;
                        var newDay = desiredDay;
                        newDay.setHours(hour);
                        var newEve = new Event({
                          paid: true,
                          day: newDay,
                          trackID: submission.trackID,
                          channelID: chanID
                        });
                        newEve.save()
                          .then(function(eve) {
                            console.log("newEve:")
                            console.log(eve);
                            eve.day = new Date(eve.day);
                            sendEmail(submission.name, submission.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + submission.name + ",<br><br>Thank you for completing the last step for promotion of your track! After reviewing the track and receiving your payment we have scheduled the repost on " + channel.displayName + " for " + eve.day.toLocaleDateString() + ". Thank you for your business and if you haven’t already, check out our other PR services over at (ARTISTS UNLIMITED x OTHER PAY FOR POST CHANNELS)<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
                            res.send({});
                          })
                          .then(null, next);
                      }
                    }
                  });
                  ind++;
                  console.log(ind);
                }
              });
          } else {
            console.log('filling slot');
            ev.trackID = submission.trackID;
            ev.save().then(function(ev) {
              ev.day = new Date(ev.day);
              sendEmail(submission.name, submission.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + submission.name + ",<br><br>Thank you for completing the last step for promotion of your track! After reviewing the track and receiving your payment we have scheduled the repost on " + channel.displayName + " for " + ev.day.toLocaleDateString() + ". Thank you for your business and if you haven’t already, check out our other PR services over at (ARTISTS UNLIMITED x OTHER PAY FOR POST CHANNELS)<br><br>Goodluck and stay true to the art,<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
              res.send({});
            })
          }
        })
    })
    .then(null, next);
});