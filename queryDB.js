/*
 * @manDrillEmail : sending email module object
 * @mongoose : mongoose module object
 * @Follower : Follower module object
 * @csv : csv write stream module object
 */


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scemail');
var fs = require('fs');
var csv = require('csv-write-stream');


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

    queryDBCSV({
        followers: {
            $gt: 20000,
            $lt: 40000
        }
    });
});
// - 4/17 - [1,2],[3,4],[5,6],[7,8]
// - 4/20 - [9,10],[11,12],[13,14],[15,16]
// - 4/25 - [17,18],[19,20],[21,22],[23,24],[25,26],[27,28],[29,30]
// - 5/1  - [31,32],[33,34],[35,36],[37,38],[39,40],[41,42],[43,44],[45,46],[47,48],[49,50]


//to get email: node sendemailtodb.js {followers:{$gt:50000}} email
//run the query and send an email to every user that was queried
//mandrill email sending file - //server/app/mandrill/sendEmail.js

//to get csv: node sendemailtodb.js {followers:{$gt:50000}, randomDay:1} csv

//Follower.find({}, function (error, data) {
//    console.log(data);
//    res.json(data);
//});

// var mongoQuery = process.argv[2];
// var ProcessFlag = process.argv[3];

// if (ProcessFlag == "csv") {
//     createAndSendFile(mongoQuery);
//     console.log("CSV process");
// } else if (ProcessFlag == "email") {
//     processSendEmail(mongoQuery);
//     console.log("EMAIL process");
// } else {
//     console.error("Nothing to process. Bad request");
// }

// function processSendEmail(query) {
//     console.log(query);
// }

// console.log(mongoQuery);
// console.log(ProcessFlag);

function queryDBCSV(query) {
    var headers = [
        'email',
        'numTracks',
        'artist',
        'soundcloudID',
        'soundcloudURL',
        'username',
        'followers',
        'randomDay'
    ];

    var writer = csv({
        headers: headers
    });
    writer.pipe(fs.createWriteStream('query.csv'));

    var num = 0;
    var stream = SCEmails.find(query).stream();
    stream.on('data', function(flwr) {
        var row = [];
        headers.forEach(function(elm) {
            row.push(flwr[elm]);
        });
        num++;
        writer.write(row);
    });
    stream.on('close', function() {
        console.log(num);
        console.log('Writing CSV...');
        setTimeout(function() {
            process.exit();
            writer.end();
        }, 10000);

    });
    stream.on('error', function(err) {
        console.log(err);
    });
}