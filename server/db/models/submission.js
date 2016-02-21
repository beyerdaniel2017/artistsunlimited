var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  channelIDS: {
    type: [Number]
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
  invoiceIDS: {
    type: [String]
  }
});

mongoose.model("Submission", schema);