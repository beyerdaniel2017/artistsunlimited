var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    trackUrl: {
        type: String
    },
    downloadUrl: {
        type: String
    },
    email: {
    	type: String
    }
});

mongoose.model("DownloadTrack", schema);