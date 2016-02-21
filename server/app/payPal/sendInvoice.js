'use strict';
var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'live',
  'client_id': 'AS_XdXBWw77UyF_QkMtq53Dve9CueqCscfdqPH2Rk-ypPe1l3MhBMgZIUfCs9QoL3rR9FhtqVg5XDXVP',
  'client_secret': 'ELBPMRDOYTKJ060PVEyTMQwBvH2HwQEFWwSziOKp9hYG48z8UXendg3Us_9rlm3ioUMT3Go79KKd2VWa',
});

module.exports = function(submission, channels) {
  submission.channelIDS.forEach(function(id, index) {
    var channel = channels.find(function(cha) {
      return cha.channelID = id;
    });
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
        "name": "For " + channel.displayName + " repost.",
        "quantity": 1,
        "unit_price": {
          "currency": "USD",
          "value": channel.price
        }
      }],
      "note": "For " + channel.displayName + " repost.",
      "payment_term": {
        "term_type": "NET_45"
      },
      "tax_inclusive": false,
      "total_amount": {
        "currency": "USD",
        "value": channel.price
      }
    }

    paypal.invoice.create(invoice_json, function(error, invoice) {
      if (error) {
        throw error;
      } else {
        console.log("Create Invoice Response");
        console.log(invoice);
        paypal.invoice.send(invoice.id, function(error, rv) {
          if (error) {
            console.log(error.response);
            throw error;
          } else {
            submission.invoiceIDS[index] = invoice.id;
            Submission.findByIdAndUpdate(submission._id, submission).exec()
              .then(function(sub) {})
              .then(null, console.log);
          }
        });
      }
    });
  });
}