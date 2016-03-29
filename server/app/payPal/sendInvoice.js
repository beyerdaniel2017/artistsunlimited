'use strict';
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var Channel = mongoose.model('Channel');
var paypal = require('paypal-rest-sdk');
var ppConfig = require('./../../env').PAYPAL;
paypal.configure({
  'mode': ppConfig.mode,
  'client_id': ppConfig.clientID,
  'client_secret': ppConfig.clientSecret,
});

module.exports = function(submission, channelID) {
  var index = submission.channelIDS.indexOf(channelID);
  Channel.findOne({
      channelID: channelID
    }).exec()
    .then(function(chan) {
      var invoice_json = {
        "merchant_info": {
          "email": "kevinwzimmermann@gmail.com",
          "first_name": "Kevin",
          "last_name": "Zimmermann",
          "business_name": "La Tropicál Distributions",
          "phone": {
            "country_code": "001",
            "national_number": "6179906330"
          },
          "address": {
            "line1": "4585 Ponce De Leon Blvd",
            "city": "Coral Gables",
            "state": "FL",
            "postal_code": "33143",
            "country_code": "US"
          }
        },
        "billing_info": [{
          "email": submission.email
        }],
        "items": [{
          "name": submission.title + " repost on " + chan.displayName + ".",
          "quantity": 1,
          "unit_price": {
            "currency": "USD",
            "value": chan.price
          }
        }],
        "note": submission.title + " repost on " + chan.displayName + ".",
        "payment_term": {
          "term_type": "NET_45"
        },
        "tax_inclusive": false,
        "total_amount": {
          "currency": "USD",
          "value": chan.price
        }
      };

      paypal.invoice.create(invoice_json, function(error, invoice) {
        if (error) {
          console.log(error);
        } else {
          paypal.invoice.send(invoice.id, function(error, rv) {
            if (error) {
              console.log(error);
            } else {
              submission.invoiceIDS[index] = invoice.id;
              Submission.findByIdAndUpdate(submission._id, submission).exec()
                .then(function(sub) {})
                .then(null, console.log);
            }
          });
        }
      });
    })
    .then(null, console.log);
}