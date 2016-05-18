var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  userID: {
    type: Number
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
  },
  completed: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'track'
  }
});

mongoose.model("RepostEvent", schema);