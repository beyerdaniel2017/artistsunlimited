'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var CustomSubmission = mongoose.model('CustomSubmission');

router.post('/addCustomSubmission', function(req, res, next) {

  CustomSubmission.findByIdAndUpdate(req.body.userID, req.body, {
      new: true,
      upsert: true
    })
    .exec()
    .then(function(cSubmission) {
      res.send(cSubmission)
    });
});

router.get('/getCustomSubmission/:userID', function(req, res, next) {
  CustomSubmission.findOne({
      userID: req.params.userID
    })
    .exec()
    .then(function(cSubmission) {
      res.send(cSubmission)
    });
});