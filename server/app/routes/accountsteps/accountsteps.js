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
var scWrapper = require("../../SCWrapper/SCWrapper.js");
scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.redirectURL
});
router.post('/sendVarificationAccount', function(req, res, next) {
  paypalCalls.sendPayout(req.body.email, req.body.price, "Verification trial amount.", "N/A")
    .then(function(payout) {
      res.send(payout);
    }).then(null, next);
})

router.post('/sendTestEmail', function(req, res, next) {
  var toEmail = req.body.email;
  var body = formatForTestEmail(req.body.emailObj.body, toEmail);
  var subject = formatForTestEmail(req.body.emailObj.subject, toEmail);
  body =
    sendEmail("Johnny", toEmail, "Artists Unlimited", "coayscue@artistsunlimited.com", subject, body);
  res.send({
    success: true
  });
});

function formatForTestEmail(item, email) {
  return item.replace(/{TRACK_TITLE_WITH_LINK}/g, "<a href='https://soundcloud.com/olivernelson/oliver-nelson-ft-kaleem-taylor-aint-a-thing-3'>Oliver Nelson ft. Kaleem Taylor - Ain't A Thing</a>").replace(/{TRACK_TITLE}/g, "Oliver Nelson ft. Kaleem Taylor - Ain't A Thing").replace(/{SUBMITTERS_EMAIL}/g, email).replace(/{SUBMITTERS_NAME}/g, "Johnny Submitter").replace(/{TRACK_ARTIST_WITH_LINK}/g, "<a href='https://soundcloud.com/olivernelson'>Oliver Nelson</a>").replace(/{TRACK_ARTIST}/g, "Oliver Nelson").replace(/{SUBMITTED_TO_ACCOUNT_NAME}/g, "La Tropical").replace(/{SUBMITTED_ACCOUNT_NAME_WITH_LINK}/g, "<a href='https://soundcloud.com/latropical'>La Tropical</a>").replace(/{TRACK_ARTWORK}/g, "<img style='width:200px; height: 200px' src='https://i1.sndcdn.com/artworks-000182530607-7nuozs-t300x300.jpg'></img>").replace(/{ACCEPTED_CHANNEL_LIST}/g, "La Tropical, Etiquette Noir, and Le Sol").replace(/{ACCEPTED_CHANNEL_LIST_WITH_LINK}/g, "<a href='https://soundcloud.com/latropical'>La Tropical</a>, <a href='https://soundcloud.com/etiquettenoir'>Etiquette Noir</a>, and <a href='https://soundcloud.com/lesolmusique'>Le Sol</a>").replace(/{TODAYSDATE}/g, new Date().toLocaleDateString()).replace(/\n/g, "<br>");
}