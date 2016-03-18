'use strict';
var https = require('https');
var router = require('express').Router();
var Promise = require('bluebird');

module.exports = router;

var mongoose = require('mongoose');
var DownloadTrack = mongoose.model('DownloadTrack');
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');


router.get('/track', function(req, res, next){
  var downloadTrackId = req.query.trackid;
  DownloadTrack
    .find({ _id : downloadTrackId })
    .exec()
    .then(function(downloadTrack){
      res.send(downloadTrack);
      return res.end();
    })
    .catch(next);
});