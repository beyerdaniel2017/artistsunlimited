
'use strict';

var router = require('express').Router();

module.exports = router;

var Busboy = require('busboy');
var sendEmail = require("../../mandrill/sendEmail.js");

router.post('/', function(req, res, next) {
  var fileObj = {};
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var buffer = new Buffer('');
    file.on('data', function(data) {
      buffer = Buffer.concat([buffer, data]);
    });
    file.on('end', function() {
      fileObj = {
        fieldname: fieldname,
        buffer: buffer.toString('base64'), 
        filename: filename,
        encoding: encoding, 
        mimetype: mimetype
      };
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    req.body[fieldname] = val;
  });
  busboy.on('finish', function() {
    var attachments = [
      {
        "type": fileObj.mimetype,
        "name": fileObj.filename,
        "content": fileObj.buffer
      }
    ];
    sendEmail('Edward', 'edward@peninsulamgmt.com', req.body.name, req.body.email, 'Premier File Submission', req.body.comment, attachments);  
    res.end();
  });
  req.pipe(busboy);
});
