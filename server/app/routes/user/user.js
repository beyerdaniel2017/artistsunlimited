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
  var minFollowers = (req.body.minFollower ? parseInt(req.body.minFollower) : 0);
  var maxFollowers = (req.body.maxFollower ? parseInt(req.body.maxFollower) : 100000000);
  var url = (req.body.url != "") ? req.body.url : undefined;
  var searchObj = {};
  if(url != undefined){
    url = url.toString().replace('http://','').replace('https://','');
    searchObj['soundcloud.permalinkURL'] = new RegExp(url);
  }
  if(maxFollowers > 0){
    searchObj['soundcloud.followers'] = {
      $gt: minFollowers,
      $lte: maxFollowers,
    }
  }
  User.find(searchObj)
  .exec()
    .then(function(user) {
      res.send(user);
    })
});