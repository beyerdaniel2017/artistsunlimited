var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  channelID: {
    type: String
  },
  paid: {
    type: Boolean
  },
  trackID: {
    type: Number
  },
  day: {
    type: Date
  },
  hour: {
    type: Number
  }
});

mongoose.model("Event", schema);