var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  trackURL: {
    type: String
  },
  downloadURL: {
    type: String
  },
  email: {
    type: String
  },
  artworkURL: {
    type: String
  },
  trackID: {
    type: Number
  },
  artistID: {
    type: Number
  },
  playlistID: {
    type: String
  }
});

mongoose.model("DownloadTrack", schema);