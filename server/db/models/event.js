var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  channelID: {
    type: Number
  },
  paid: {
    type: Boolean
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
  day: {
    type: Date
  }
});

mongoose.model("Event", schema);