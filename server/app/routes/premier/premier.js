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
  var skipcount = req.query.skip;
  var limitcount = req.query.limit;
  var paidRepostIds = [];
  if (req.user.paidRepost.length > 0) {
    req.user.paidRepost.forEach(function(acc) {
      paidRepostIds.push(acc.userID);
    })
  }
  var searchObj = {
    status: 'new',
    userID: {
      $in: paidRepostIds
    }
  };
  if (genre != undefined && genre != 'null') {
    searchObj = {
      status: 'new',
      genre: genre
    };
  }
  PremierSubmission
    .find(searchObj)
    .populate('userID')
    .skip(skipcount)
    .limit(limitcount)

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
      userID: body.fields.userID,
      s3URL: data.Location,
      genre: body.fields.genre,
      email: body.fields.email,
      name: body.fields.name,
      comment: body.fields.comment
    });
    return newPremierSubmission.save();
  }

  function mailData() {
    // var attachments = [{
    //   'type': body.file.mimetype,
    //   'name': body.file.newfilename,
    //   'content': body.file.buffer.toString('base64')
    // }];
    // var email_body = '<b>Sender Comment: </b> ' +
    //   body.fields.comment +
    //   '<br />' +
    //   '<br />' +
    //   '<b>Sender Name: </b> ' +
    //   body.fields.name +
    //   '<br />' +
    //   '<br />' +
    //   '<b>Sender Email: </b> ' +
    //   body.fields.email;
    // sendEmail('Edward', 'edward@peninsulamgmt.com', 'Artists Unlimited', 'coayscue@artistsunlimited.com', 'Premier Submission', email_body, attachments);
    return res.end();
  }

  function errorHandler(err) {
    return res.status(400).send(err);
  }
});

router.put('/accept', function(req, res, next) {
  PremierSubmission.findByIdAndUpdate(req.body.submi._id, req.body.submi, {
    new: true
  })

  .then(function(sub) {
      res.send(sub);
    })
    .then(null, next);
});

router.put('/decline', function(req, res, next) {
  PremierSubmission.findOneAndRemove({
    _id: req.body.submission._id
  })

  .then(function(sub) {
      sendEmail(sub.name, sub.email, "Edward Sanchez", "feedback@peninsulamgmt.com", "Music Submission", "Hey " + sub.name + ",<br><br>First of all thank you so much for submitting <a href='" + sub.s3URL + "'>your track</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.<br><br> We look forward to hearing your future compositions and please remember to submit them at <a href='https://artistsunlimited.com/submit'>Artists Unlimited</a>.<br><br>Goodluck and stay true to the art,<br><br>Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com/edwardlatropical");
      res.send(sub);
    })
    .then(null, next);
});

router.post('/delete', function(req, res, next) {
  PremierSubmission
    .remove({
      _id: req.body.id
    })

  .then(function() {
      return res.end();
    })
    .then(null, function(err) {
      next(err);
    });
});