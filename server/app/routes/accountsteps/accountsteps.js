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
var paypal = require('paypal-rest-sdk');
var rootURL = require('../../../env').ROOTURL;
var ppConfig = require('../../../env').PAYPAL;
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

paypal.configure({
  'mode': ppConfig.mode,
  'client_id': ppConfig.clientID,
  'client_secret': ppConfig.clientSecret,
});

router.post('/sendVarificationAccount', function(req, res, next) {
	var email = req.body.email;
	var price = req.body.price;
  	var sender_batch_id = Math.random().toString(36).substring(9);
    var create_payout_json = {
        "sender_batch_header": {
            "sender_batch_id": sender_batch_id,
            "email_subject": "You have a varification amount payment"
        },
        "items": [
            {
                "recipient_type":"EMAIL",
                "amount": {
                    "value": price,
                    "currency": "USD"
                },
                "receiver": email,
                "note": "Thank you.",
                "sender_item_id": "item_3"
            }
        ]
    };
    
    var sync_mode = 'true';
    paypal.payout.create(create_payout_json, sync_mode, function (error, payout) {
        if (error) {
            return res.json(error);
        } else {
            return res.json(payout);
        }
    });
})

