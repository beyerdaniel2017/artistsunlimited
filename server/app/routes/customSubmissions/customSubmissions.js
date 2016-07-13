'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var CustomSubmission = mongoose.model('CustomSubmission');

router.post('/addCustomSubmission', function(req, res, next) {
	// var customSubmission = new CustomSubmission({
 //  	'heading.text': req.body.heading.text,
 //    'heading.style.fontSize': req.body.heading.style.fontSize,
 //    'heading.style.fontColor': req.body.heading.style.fontColor,
 //    'heading.style.fontWeight': req.body.heading.style.fontWeight,
 //    'subHeading.text': req.body.subHeading.text,
 //    'subHeading.style.fontWeight': req.body.subHeading.style.fontWeight,
 //    'subHeading.style.fontSize': req.body.subHeading.style.fontSize,
 //    'subHeading.style.fontColor': req.body.subHeading.style.fontColor,
 //    'inputFields.style.border': req.body.inputFields.style.border,
 //    'inputFields.style.borderRadius': req.body.inputFields.style.borderRadius,
 //    'inputFields.style.borderColor': req.body.inputFields.style.borderColor,
 //    'button.text': req.body.button.text,
 //    'button.style.fontSize': req.body.button.style.fontSize,
 //    'button.style.fontColor': req.body.button.style.fontColor,
 //    'button.style.bgColor': req.body.button.style.bgColor
	// })

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
  CustomSubmission.findOne({userID : req.params.userID})
  .exec()
  .then(function(cSubmission) {
    res.send(cSubmission)
  });
});