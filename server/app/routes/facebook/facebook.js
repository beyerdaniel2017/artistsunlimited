var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');

router.get('/', function(req, res, next) {
  if (req.query['hub.verify_token'] === 'let_me_manage') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
})