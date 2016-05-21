var mongoose = require('mongoose');
var User = mongoose.model('User');
var SCEmails = mongoose.model('SCEmails');
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
  var searchObj = {_id : {$ne: req.user._id}};
  if(url != undefined){
    url = url.toString().replace('http://','').replace('https://','');
    searchObj['soundcloud.permalinkURL'] = new RegExp(url);
  }
  if(maxFollowers > 0){
    searchObj['soundcloud.followers'] = {
      $gte: minFollowers,
      $lte: maxFollowers,
    }
  }
  User.find(searchObj)
  .exec()
    .then(function(user) {
      res.send(user);
    })
});
router.post('/syncSCEmails', function(req, res, next) {
  SCEmails.find({})
  .limit(400)
  .exec()
  .then(function(scemails) {
    scemails.forEach(function(sce) {
      User.update({
        'soundcloud.id': sce.soundcloudID
      },
      {
        $set: {
          'soundcloud.followers': sce.followers, 
          'soundcloud.permalinkURL': sce.soundcloudURL,
          'soundcloud.id': sce.soundcloudID,
          'soundcloud.username': sce.username,
          name: sce.username,
          email: sce.email
        }
      },{upsert:true}, function(err, user){
        if(err){
          console.log('err', err);
        }
        else{
          console.log('user updated successfully');
        }
      });
    });
  });    
});