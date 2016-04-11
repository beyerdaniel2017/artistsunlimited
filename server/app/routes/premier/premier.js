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
          fileSize: 20 * 1024 * 1024,
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
    sendEmail('Edward', 'edward@peninsulamgmt.com', body.fields.name, 'coayscue@artistsunlimited.co', 'Premier Submission', email_body, attachments);
    return res.end();
  }

  function errorHandler(err) {
    return res.status(400).send(err);
  }
});