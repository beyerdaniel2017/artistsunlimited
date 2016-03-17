var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    scUrl: {
        type: String
    },
    downloadUrl: {
        type: String
    }
});

mongoose.model("DownloadUrl", schema);