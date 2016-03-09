var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  channelIDS: {
    type: [Number]
  },
  invoiceIDS: {
    type: [String]
  },
  paidInvoices: {
    type: [String]
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
  }
});

mongoose.model("Submission", schema);