var mongoose = require('mongoose');
var User = mongoose.model('User');
var SCEmails = mongoose.model('SCEmails');
var Trade = mongoose.model('Trade');
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
  if (url != undefined) {
    url = url.toString().replace('http://', '').replace('https://', '');
    searchObj['soundcloud.permalinkURL'] = new RegExp(url);
  }
  if (maxFollowers > 0) {
    searchObj['soundcloud.followers'] = {
      $gte: minFollowers,
      $lte: maxFollowers,
    }
  }
  var notInUsers = [];
  Trade.find({
    $or: [{
      'p1.user': req.user._id
    }, {
      'p2.user': req.user._id
    }]
  })
  .exec()
  .then(function(trades) {
    if(trades.length > 0){
      trades.forEach(function(trade, index) {
        var u1 = trade.p1.user.toString();
        var u2 = trade.p2.user.toString();
        if(notInUsers.indexOf(u1) == -1) {
          notInUsers.push(u1);
        }
        if(notInUsers.indexOf(u2) == -1) {
          notInUsers.push(u2);
        }
        if(index == (trades.length - 1)){
          searchObj['_id'] = {$nin : notInUsers};
          findUsers(searchObj);
        }
      });
    }
    else{
      searchObj['_id'] = {$nin : req.user._id};
      findUsers(searchObj);
    }
  });
  var findUsers = function(sObj){
    User.find(sObj)
    .sort({'soundcloud.followers' : -1})
    .limit(1000)
    .exec()
    .then(function(user) {
      res.send(user);
    })
  }
});

router.post('/syncSCEmails', function(req, res, next) {
  var sCount = 0;
  var page = 0;
  var lCount = 10000;
  var processEmails = function(skipCount, limitCount){
  SCEmails.find({})
    .skip(skipCount)
    .limit(limitCount)
    .exec()
    .then(function(scemails) {
      if(scemails.length > 0){
        scemails.forEach(function(sce, index) {
        User.update({
          'soundcloud.id': sce.soundcloudID
        }, {
          $set: {
            'soundcloud.followers': sce.followers,
            'soundcloud.permalinkURL': sce.soundcloudURL,
            'soundcloud.id': sce.soundcloudID,
            'soundcloud.username': sce.username,
            name: sce.username,
            email: sce.email
          }
        }, {
          upsert: true
        }, function(err, user) {
              if(index == (scemails.length - 1)){
                page++;
                sCount = (page*lCount);
                console.log(page + "===" + sCount + "===" + lCount)
                processEmails(sCount, lCount)
          }
        });
      });
      }
    });
  } 
  processEmails(sCount, lCount);     
});