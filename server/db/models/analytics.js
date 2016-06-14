var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    pid: {
        type: String
    },
    pageid: {
        type: String
    },
    user: {
        type: String,
        index: { unique: true }
    },
    value: []
});

var twitter_schema = new mongoose.Schema({
    userid: {
        type: String,
        index: { unique: true }
    },
    screen_name: {
        type: String
    },
    follows:[]
});

var youtube_schema=new mongoose.Schema({}, { strict: false });
var instagram_schema=new mongoose.Schema({}, { strict: false });

mongoose.model("Analytics", schema);
mongoose.model("Twitter",twitter_schema);
mongoose.model("Youtube",youtube_schema);
mongoose.model("Instagram",youtube_schema);
