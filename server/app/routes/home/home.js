
'use strict';

var router = require('express').Router();

module.exports = router;

var sendEmail = require("../../mandrill/sendEmail.js");

router.post('/application', function(req, res, next) {
  var emailBody =  "<b>First Name: </b> " + req.body.firstName + 
                    "<br />" + 
                    "<br />" + 
                    "<b>Last Name: </b> " + req.body.lastName +
                    "<br />" +
                    "<br />" +
                    "<b>User Name: </b> " + req.body.userName +
                    "<br />" +
                    "<br />" +
                    "<b>Password: </b> " + req.body.password +
                    "<br />" +
                    "<br />" +
                    "<b>Email: </b> " + req.body.email +
                    "<br />" +
                    "<br />";
  sendEmail('Edward', 'edward@peninsulamgmt.com', req.body.name, req.body.email, 'Application Submission', emailBody);  
  res.end();
});
