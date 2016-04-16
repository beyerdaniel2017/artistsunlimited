/*
 * @manDrillEmail : sending email module object
 * @mongoose : mongoose module object
 * @Follower : Follower module object
 * @csv : csv write stream module object
 */


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scemail');

var db = mongoose.connection;

db.on('error', function (err)
{
    console.log('connection error', err);
});

db.once('open', function ()
{
    console.log('connected.');
});

var Schema = mongoose.Schema;
var SCEmailsSchema = new Schema(
{
    email: String,
    numTracks: Number,
    artists: Boolean,
    soundcloudID: Number,
    soundcloudURL: String,
    username: String,
    followers: Number,
    randomDay: Number
});

var SCEmails = mongoose.model('SCEmails', SCEmailsSchema);

SCEmailsSchema.methods.findScEmails = function (query)
{
    SCEmails.findOne(query, function(err, emailData)
    {
        if (err) return console.error(err);
        console.dir(emailData);
    });
}

/*
 * To test if database connection and table creation code working.
 * @type Seeder
 * START
 */

//var scEmailSeed = new SCEmails({
//    email : 'test@gmail.com',
//    numTracks : 99,
//    artists : 1,
//    followers : 10000
//});
// 
//scEmailSeed.save(function (err, data)
//{
//    if (err)
//        console.log(err);
//    else
//        console.log('Saved ', data );
//});

/*
 * END
 */

var csv = require('csv-write-stream');
var manDrillEmail = require("./server/app/mandrill/sendEmail");


//to get email: node sendemailtodb.js {followers:{$gt:50000}} email
//run the query and send an email to every user that was queried
//mandrill email sending file - //server/app/mandrill/sendEmail.js

//to get csv: node sendemailtodb.js {followers:{$gt:50000}, randomDay:1} csv

//Follower.find({}, function (error, data) {
//    console.log(data);
//    res.json(data);
//});

var mongoQuery = process.argv[2];
var ProcessFlag = process.argv[3];

if (ProcessFlag == "csv")
{
    createAndSendFile();
    console.log("CSV process");
}
else if (ProcessFlag == "email")
{
    processSendEmail(mongoQuery);
    console.log("EMAIL process");
}
else
{
    console.error("Nothing to process. Bad request");
}

function processSendEmail(query)
{
    console.log(query);
}

console.log(mongoQuery);
console.log(ProcessFlag);

function createAndSendFile(query)
{
    var headers = [
        'email',
        'numTracks',
        'artists',
        'soundcloudID',
        'soundcloudURL',
        'username',
        'followers',
        'randomDay'
    ];

    var writer = csv({
        headers: headers
    });

    writer.pipe(fs.createWriteStream('queryfile'));

    var stream = Follower.find(query).stream();
    stream.on('data', function (flwr)
    {
        var row = [];

        columns.forEach(function (elm)
        {
            if (elm === 'allEmails')
            {
                row.push(flwr[elm].join(''));
            }
            else
            {
                row.push(flwr[elm]);
            }
        });
        writer.write(row);
    });
    console.log(process.argv);
}