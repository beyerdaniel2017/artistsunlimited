var csv = require('csv-write-stream');

//to get email: node sendemailtodb.js {followers:{$gt:50000}} email
//run the query and send an email to every user that was queried
//mandrill email sending file - //server/app/mandrill/sendEmail.js


//to get csv: node sendemailtodb.js {followers:{$gt:50000}, randomDay:1} csv
function createAndSendFile(query) {
  var headers = [
    email: String,
    numTracks: Number,
    artists: Boolean,
    soundcloudID: Number,
    soundcloudURL: String,
    username: String,
    followers: Number,
    randomDay: Number
  ]
  var writer = csv({
    headers: headers
  });
  writer.pipe(fs.createWriteStream('queryfile'));
  var stream = Follower.find(query).stream();
  stream.on('data', function(flwr) {
    var row = [];
    columns.forEach(function(elm) {
      if (elm === 'allEmails') {
        row.push(flwr[elm].join(''));
      } else {
        row.push(flwr[elm]);
      }
    });
    writer.write(row);
    //close file
  });