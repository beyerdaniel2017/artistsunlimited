'use strict';
var router = require('express').Router();
module.exports = router;
var Busboy = require('busboy');
var AWS = require('aws-sdk');
var sendEmail = require("../../mandrill/sendEmail.js");
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var mongoose = require('mongoose');
var PremierSubmission = mongoose.model('PremierSubmission');
var awsConfig = require('./../../../env').AWS;
var rootURL = require('../../../env').ROOTURL;

router.get('/unaccepted', function(req, res, next) {
  var genre = req.query.genre ? req.query.genre : undefined;
  var skipcount  = req.query.skip;
  var limitcount  = req.query.limit;
  var searchObj = {status: 'new'};
  if(genre != undefined && genre != 'null'){
    searchObj = {status: 'new', genre: genre};
  }
  PremierSubmission
  .find(searchObj)
  .skip(skipcount)
  .limit(limitcount)
  .exec()
  .then(function(subs) {
    res.send(subs);
  })
  .then(null, next);
});

router.post('/', function(req, res, next) {
  parseMultiPart()
    .then(uploadToBucket)
    .then(saveToDB)
    .then(mailData)
    .catch(errorHandler);

  var body = {
    fields: {},
    file: {}
  };

  function parseMultiPart() {
    return new Promise(function(resolve, reject) {
      var busboy = new Busboy({
        headers: req.headers,
        limits: {
          fileSize: 100 * 1024 * 1024,
          files: 1
        }
      });
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

        var buffer = new Buffer('');
        var type = mimetype.split('/')[1];
        var newfilename = (filename.substr(0, filename.lastIndexOf('.')) || filename) + '_' + Date.now().toString() + '.' + type;

        file.on('data', function(data) {
          buffer = Buffer.concat([buffer, data]);
        });

        file.on('limit', function() {
          reject('Error: File size cannot be more than 20 MB');
        });

        file.on('end', function() {
          body.file = {
            fieldname: fieldname,
            buffer: buffer,
            filename: filename,
            newfilename: newfilename,
            encoding: encoding,
            mimetype: mimetype
          };
        });
      });
      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        body.fields[fieldname] = val;
      });
      busboy.on('finish', function() {
        resolve();
      });

      busboy.on('error', function(err) {
        reject(err);
      });
      req.pipe(busboy);
    });
  }

  function uploadToBucket() {
    return new Promise(function(resolve, reject) {
      AWS.config.update({
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      });

      var data = {
        Key: body.file.newfilename,
        Body: body.file.buffer,
        ContentType: body.file.mimetype
      };
      var s3 = new AWS.S3({
        params: {
          Bucket: awsConfig.bucketName
        }
      });
      s3.upload(data, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  function saveToDB(data) {

    var newPremierSubmission = new PremierSubmission({
      s3URL: data.Location,
      genre: body.fields.genre,
      email: body.fields.email,
      name: body.fields.name,
      comment: body.fields.comment
    });
    return newPremierSubmission.save();
  }

  function mailData() {
    var attachments = [{
      'type': body.file.mimetype,
      'name': body.file.newfilename,
      'content': body.file.buffer.toString('base64')
    }];
    var email_body = '<b>Sender Comment: </b> ' +
      body.fields.comment +
      '<br />' +
      '<br />' +
      '<b>Sender Name: </b> ' +
      body.fields.name +
      '<br />' +
      '<br />' +
      '<b>Sender Email: </b> ' +
      body.fields.email;
    sendEmail('Edward', 'edward@peninsulamgmt.com', 'Artists Unlimited', 'coayscue@artistsunlimited.co', 'Premier Submission', email_body, attachments);
    return res.end();
  }

  function errorHandler(err) {
    return res.status(400).send(err);
  }
});

router.put('/accept', function(req, res, next) {
  PremierSubmission.findByIdAndUpdate(req.body.submi._id, req.body, {
    new: true
  })
  .exec()
  .then(function(sub) {
    sendEmail(sub.name, sub.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Congratulations on your Premier Submission ", '<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="padding:0"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse"><tr><td><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:url(' + 'https://artistsunlimited.co' + '/assets/images/fade-background.png) no-repeat;color:white;background-size:cover;background-position:center;"><tr><td align="left" style="padding:20px" width="50%"><a href="https://artistsunlimited.co"><img src="' + 'https://artistsunlimited.co' + '/assets/images/logo-white.png" height="45" style="height:45px" alt="AU"/></a></td><td align="right" style="font-size:22px;color:white;font-weight:bold;padding:20px" width="50%">Artists <br/>Unlimited</td></tr><tr><td colspan="2" align="center" style="padding:40px 0 30px 0;font-size:28px;font-weight:bold;font-family:Arial,sans-serif;color:white"><h2>We loved the track!</h2><p>The team listened audio file submitted by you <br/>and it got accepted for promotion.</p></td></tr></table></td></tr><tr><td bgcolor="#ffffff" style="padding:40px 30px 40px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="color:#153643;font-family:Arial,sans-serif;font-size:24px">Hey ' + sub.name + '!</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">First of all thank you so much for submitting your track to us! We checkedout your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by channels on our network. All you need to do is click the button below.</td></tr><tr><td style="padding:20px 0 10px 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">To maintain our feed’s integrity, we do not offer more than one repost of the approved track per channel. With that said, if you are interested in more extensive PR packages and campaigns that guarante eanywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be here to help you with the rest.</td></tr><tr><td style="padding:20px 0 0 0;color:#153643;font-family:Arial,sans-serif;font-size:16px;line-height:20px">All the best,<br/><br/>Edward Sanchez<br/>Peninsula MGMT Team<br>www.facebook.com/edwardlatropical</td></tr></table></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/pay/' + sub._id + '" style="background-color:#f5bbbc;border:transparent;border-radius:0;padding:14px 50px;color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:3px;text-decoration:none;margin:30px 0;" class="btn btn-enter">Get promoted</a></td></tr><tr><td align="center" width="100%" style="padding:30px 30px 50px 30px"><a href="' + rootURL + '/login" style="color:#f5d3b5">Artist Tools</a></td></tr><tr><td style="padding:30px 30px 30px 30px"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" width="33%"><a href="https://twitter.com/latropicalmusic" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-twitter.png" alt="Twitter" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://www.facebook.com/latropicalofficial" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-facebook.png" alt="Facebook" width="38" height="38" style="display:block" border="0"/></a></td><td align="center" width="33%"><a href="https://soundcloud.com/latropical" style="color:#fff"><img src="' + 'https://artistsunlimited.co' + '/assets/images/email-soundcloud.png" alt="SoundColud" width="38" height="38" style="display:block" border="0"/></a></td></tr></table></td></tr></table></td></tr></table>');
    res.send(sub);
  })
  .then(null, next);
});

router.put('/decline', function(req, res, next) {
  PremierSubmission.findByIdAndUpdate(req.body.submission._id, req.body, {
    new: true
  })
  .exec()
  .then(function(sub) {
    sendEmail(sub.name, sub.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting your track <a href='" + sub.s3URL + "'>track</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at <a href='https://artistsunlimited.co/submit'>Artists Unlimited</a>.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
    res.send(sub);
  })
  .then(null, next);
});

router.post('/delete', function(req, res, next) {
  PremierSubmission
  .remove({
    _id: req.body.id
  })
  .exec()
  .then(function() {
    return res.end();
  })
  .then(null, function(err) {
    next(err);
  });
});