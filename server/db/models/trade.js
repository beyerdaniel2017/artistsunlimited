'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  messages: [],
  tradeType: {
    type: String,
    default: 'one-time'
  },
  p1: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    alert: String,
    slots: [],
    accepted: {
      type: Boolean,
      default: false
    }
  },
  p2: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    alert: String,
    slots: [],
    accepted: {
      type: Boolean,
      default: false
    }
  },
});

mongoose.model('Trade', schema);