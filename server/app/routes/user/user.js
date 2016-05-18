var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = require('express').Router();
module.exports = router;

router.get('/byId/:id', function(req, res, next) {
  User.findById(req.params.id).exec()
    .then(function(user) {
      res.send(user);
    })
});

router.post('/bySCURL', function(req, res, next) {
  User.find({
      'soundcloud.permalinkURL': new RegExp(req.body.url.substring(10, req.body.url.length))
    }).exec()
    .then(function(user) {
      res.send(user);
    })
});