'use strict';
var paypal = require('paypal-rest-sdk');
paypal.configure({
  // 'host': 'api.sandbox.paypal.com',
  // 'port': '',
  'mode': 'sandbox',
  'client_id': 'AQOFIdlz-RFeZbx6i4W5l_PUvhEdn7IRhIt3FSv7YXj5Ga3SNlzXuSHfVAkqX6xkbLVhv0boh9lx3GHi',
  'client_secret': 'EFGXm6BiNeucSWhFIOcj5yDr9vUqRHKBJuZ1951zFYE2oS71y_yxlH7WRzyLOJ7-SHFun06hg6sRp55w',
});

var invoice_json = {
  "merchant_info": {
    "email": "coayscue-facilitator@gmail.com",
    "first_name": "Christian",
    "last_name": "Ayscue",
    "business_name": "Kiko productions",
    "phone": {
      "country_code": "001",
      "national_number": "4153007010"
    },
    "address": {
      "line1": "531 Washington St.",
      "city": "Santa Clara",
      "state": "CA",
      "postal_code": "95050",
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
  "tax_inclusive": false,
  "total_amount": {
    "currency": "USD",
    "value": "0.01"
  }
}

paypal.invoice.create(invoice_json, function(error, invoice) {
  console.log("Create Invoice Response");
  console.log(invoice);
  console.log(error);
  if (error) {
    throw error;
  }
  paypal.invoice.send(invoice.id, function(error, rv) {
    console.log('send response');
    console.log(error);
    console.log(rv);
  });
});