var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  soundcloudID: {
    type: Number,
    unique: true,
    dropDups: true
  },
  soundcloudURL: {
    type: String
  },
  username: {
    type: String
  },
  followers: {
    type: Number
  },
  description: {
    type: String
  }
});

mongoose.model("TrackedUser", schema);