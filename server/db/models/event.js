var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  channelID: {
    type: Number
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
  email: {
    type: String
  },
  name: {
    type: String
  }
});

mongoose.model("Event", schema);