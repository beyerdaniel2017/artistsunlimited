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
  trackID: {
    type: Number
  },
  trackTitle: {
    type: String
  },
  trackArtworkURL: {
    type: String
  },
  artistIDS: {
    type: [Number]
  },
  artistArtworkURL: {
    type: String
  },
  artistUsername: {
    type: String
  },
  playlistIDS: {
    type: [Number]
  },
  like: {
    type: Boolean
  },
  repost: {
    type: Boolean
  },
  comment: {
    type: Boolean
  },
  SMLinks: {
    type: Object
  },
  downloadCount: {
    type: Number
  }
});

mongoose.model("DownloadTrack", schema);