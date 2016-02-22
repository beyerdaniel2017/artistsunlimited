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
  }
});

mongoose.model("Event", schema);