var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  trackURL: {
    type: String
  },
  artistURL: {
    type: String
  },
  artistID: {
    type: Number
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
  artists: {
    type: [mongoose.Schema.Types.Mixed]
  },
  artistArtworkURL: {
    type: String
  },
  artistUsername: {
    type: String
  },
  playlists: {
    type: [mongoose.Schema.Types.Mixed]
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
    type: mongoose.Schema.Types.Mixed
  },
  downloadCount: {
    type: Number
  },
  showDownloadTracks: {
    type: String
  },
  admin: {
    type: Boolean
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  updatedOn: {
    type: Date,
    default: Date.now
  },
  socialPlatform : {
    type : String
  },
  socialPlatformValue : {
    type : String
  }
});

mongoose.model("DownloadTrack", schema);