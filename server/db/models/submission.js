var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  channelIDS: {
    type: [Number]
  },
  invoiceIDS: {
    type: [String]
  },
  events: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }]
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  trackID: {
    type: Number
  },
  title: {
    type: String
  },
  trackURL: {
    type: String
  },
  submissionDate: {
    type: Date
  },
  payment: {
    type: Object
  },
  paidChannelIDS: {
    type: [Number]
  },
  paid: {
    type: Boolean
  },
  discounted: {
    type: Boolean
  },
  genre: {
    type: String
  },
  status: {
    type: String,
    default: "poolSent"
  },
  poolSendDate: Date,
  pooledChannelIDS: {
    type: Array,
    default: []
  }
});

mongoose.model("Submission", schema);