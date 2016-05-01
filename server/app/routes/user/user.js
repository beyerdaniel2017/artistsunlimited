var mongoose = require('mongoose');
var User = mongoose.model('User');
var router = require('express').Router();
module.exports = router;

router.get('/byId/:id', function(req, res, next) {
  console.log(req.params);
  User.findById(req.params.id).exec()
    .then(function(user) {
      res.send(user);
    })
});