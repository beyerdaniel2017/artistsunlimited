'use strict';
var paypal = require('paypal-rest-sdk');
paypal.configure({
  // 'host': 'api.sandbox.paypal.com',
  // 'port': '',
  'mode': 'live',
  'client_id': 'AS_XdXBWw77UyF_QkMtq53Dve9CueqCscfdqPH2Rk-ypPe1l3MhBMgZIUfCs9QoL3rR9FhtqVg5XDXVP',
  'client_secret': 'ELBPMRDOYTKJ060PVEyTMQwBvH2HwQEFWwSziOKp9hYG48z8UXendg3Us_9rlm3ioUMT3Go79KKd2VWa',

});


//live client_id: AS_XdXBWw77UyF_QkMtq53Dve9CueqCscfdqPH2Rk-ypPe1l3MhBMgZIUfCs9QoL3rR9FhtqVg5XDXVP
//live client_secret: ELBPMRDOYTKJ060PVEyTMQwBvH2HwQEFWwSziOKp9hYG48z8UXendg3Us_9rlm3ioUMT3Go79KKd2VWa


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
    "email": "coayscue@gmail.com"
  }],
  "items": [{
    "name": "Sutures",
    "quantity": 1,
    "unit_price": {
      "currency": "USD",
      "value": 0.01
    }
  }],
  "note": "Medical Invoice 16 Jul, 2013 PST",
  "payment_term": {
    "term_type": "NET_45"
  },
  "shipping_info": {
    "first_name": "Sally",
    "last_name": "Patient",
    "business_name": "Not applicable",
    "phone": {
      "country_code": "001",
      "national_number": "5039871234"
    },
    "address": {
      "line1": "1234 Broad St.",
      "city": "Portland",
      "state": "OR",
      "postal_code": "97216",
      "country_code": "US"
    }
  },
  "tax_inclusive": false,
  "total_amount": {
    "currency": "USD",
    "value": "0.01"
  }
}

paypal.invoice.create(invoice_json, function(error, invoice) {
  if (error) {
    throw error;
  } else {
    console.log("Create Invoice Response");
    console.log(invoice);
    console.log(error);
    paypal.invoice.send(invoice.id, function(error, rv) {
      console.log(error);
      console.log(rv);
    });
  }
});
// module.exports = function(name, email, price) {
// var invoice_json = {
//   "merchant_info": {
//     "email": "kevinwzimmermann@gmail.com",
//     "first_name": "Kevin",
//     "last_name": "Zimmermann",
//     "business_name": "La Tropicál Distributions",
//     "phone": {
//       "country_code": "001",
//       "national_number": "6179906330"
//     },
//     "address": {
//       "line1": "4585 Ponce De Leon Blvd",
//       "city": "Coral Gables",
//       "state": "FL",
//       "postal_code": "33143",
//       "country_code": "US"
//     }
//   },
//   "billing_info": [{
//     "email": "coayscue@gmail.com"
//   }],
//   "items": [{
//     "name": "Sutures",
//     "quantity": 1,
//     "unit_price": {
//       "currency": "USD",
//       "value": 0.01
//     }
//   }],
//   "note": "Medical Invoice 16 Jul, 2013 PST",
//   "payment_term": {
//     "term_type": "NET_45"
//   },
//   "shipping_info": {
//     "first_name": "Sally",
//     "last_name": "Patient",
//     "business_name": "Not applicable",
//     "phone": {
//       "country_code": "001",
//       "national_number": "5039871234"
//     },
//     "address": {
//       "line1": "1234 Broad St.",
//       "city": "Portland",
//       "state": "OR",
//       "postal_code": "97216",
//       "country_code": "US"
//     }
//   },
//   "tax_inclusive": false,
//   "total_amount": {
//     "currency": "USD",
//     "value": "0.01"
//   }
// }

// paypal.invoice.create(invoice_json, function(error, invoice) {
//   if (error) {
//     throw error;
//   } else {
//     console.log("Create Invoice Response");
//     console.log(invoice);
//     paypal.invoice.send(invoice.id, function(error, rv) {
//       if (error) {
//         console.log(error.response);
//         throw error;
//       } else {
//         console.log("Send Invoice Response");
//         console.log(rv);
//       }
//     });
//   }
// });

// }