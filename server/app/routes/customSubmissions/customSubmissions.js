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

router.post('/addCustomSubmissions', function(req, res, next) {

  CustomSubmission.update({userID:req.body.userID,type:req.body.type},req.body, {
      new: true,
      upsert: true
    })
    .exec()
    .then(function(cSubmission) {
      res.send(cSubmission)
    });
});

router.get('/getCustomSubmission/:userID/:type', function(req, res, next) {
  CustomSubmission.findOne({
      userID: req.params.userID,
      type: req.params.type
    })
    .exec()
    .then(function(cSubmission) {
      res.send(cSubmission)
    });
});