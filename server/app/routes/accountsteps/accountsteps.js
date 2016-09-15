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
router.post('/sendVarificationAccount', function(req, res, next) {
  paypalCalls.sendPayout(req.body.email, req.body.price, "Verification trial amount.", "N/A")
    .then(function(payout) {
      res.send(payout);
    }).then(null, next);
})router.post('/sendTestEmail', function(req, res, next) {
	var emailObj = req.body.emailObj;
	var toEmail = req.body.email;
  	sendEmail(toEmail, toEmail, "Edward Sanchez", "feedback@peninsulamgmt.com", emailObj.subject, emailObj.body);
  	res.send({success: true});
});