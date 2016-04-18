var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scemail');
var csv = require('csv-parser')
var fs = require('fs')

var Schema = mongoose.Schema;
var SCEmailsSchema = new Schema({
  email: String,
  numTracks: Number,
  artist: Boolean,
  soundcloudID: Number,
  soundcloudURL: String,
  username: String,
  followers: Number,
  randomDay: Number
});

var SCEmails = mongoose.model('SCEmails', SCEmailsSchema);

var db = mongoose.connection;

db.on('error', function(err) {
  console.log('connection error', err);
});

db.once('open', function() {
  console.log('connected.');

  var found = 0;
  var unfound = 0;

  fs.createReadStream('members.csv')
    .pipe(csv())
    .on('data', function(data) {
      SCEmails.findOne({
          "email": data["Email Address"]
        }).exec()
        .then(function(flwr) {
          if (flwr) found++;
          else unfound++;
        })
    })

  setTimeout(function() {
    console.log('found ' + found);
    console.log('unfound ' + unfound);
  }, 600000);
});