var mongoose = require('mongoose');
var User = mongoose.model('User');
var SCEmails = mongoose.model('SCEmails');
var Trade = mongoose.model('Trade');
var https = require('https');
var router = require('express').Router();
var scConfig = global.env.SOUNDCLOUD;
var scWrapper = require("../../SCWrapper/SCWrapper.js");

scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.callbackURL
});
module.exports = router;

router.get('/isUserAuthenticate', function(req, res, next) {
  if(req.user && req.user._id != undefined){
    res.send(req.user);
  }else{
    res.send(null);
  }
});

router.get('/byId/:id', function(req, res, next) {
  User.findById(req.params.id).exec()
    .then(function(user) {
      //if (user.soundcloud.token) user.soundcloud.token = undefined;
      res.send(user);
    })
});

router.get('/getUserID', function(req, res, next) {
  User.findOne({role: 'superadmin'}).limit(1).exec()
    .then(function(user) {
      res.send(user._id);
    })
});

router.post('/bySCURL', function(req, res, next) {
  var minFollowers = (req.body.minFollower ? parseInt(req.body.minFollower) : 0);
  var maxFollowers = (req.body.maxFollower ? parseInt(req.body.maxFollower) : 100000000);
  var originalUrl = (req.body.url != "") ? req.body.url : undefined;
  var url = originalUrl;
  var searchObj = {};
  var recordRange = {
    skip: 0,
    limit: 12
  };
  if (req.body.recordRange) {
    recordRange = {
      skip: req.body.recordRange.skip || 0,
      limit: req.body.recordRange.limit || 12
    }
  }
  if (url != undefined) {
    url = url.toString().replace('http://', '').replace('https://', '');
    searchObj['soundcloud.permalinkURL'] = new RegExp(url);
  } else if (maxFollowers > 0) {
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
      if (trades.length > 0) {
        trades.forEach(function(trade, index) {
          var u1 = trade.p1.user.toString();
          var u2 = trade.p2.user.toString();
          if (notInUsers.indexOf(u1) == -1) {
            notInUsers.push(u1);
          }
          if (notInUsers.indexOf(u2) == -1) {
            notInUsers.push(u2);
          }
          if (index == (trades.length - 1)) {
            searchObj['_id'] = {
              $nin: notInUsers
            };
            findUsers(searchObj);
          }
        });
      } else {
        searchObj['_id'] = {
          $nin: req.user._id
        };
        findUsers(searchObj);
      }
    });
  var findUsers = function(sObj) {
    User.find(sObj)
      .sort({
        'soundcloud.followers': -1
      })
      .skip(recordRange.skip)
      .limit(recordRange.limit)
      .exec()
      .then(function(user) {
        if (user.length > 0) {
          res.send(user);
        } else if (originalUrl !== '' && originalUrl !== undefined) {
          var reqObj = {
            method: 'GET',
            path: '/resolve.json',
            qs: {
              url: originalUrl
            }
          };
          scWrapper.request(reqObj, function(err, result) {
            if (err) {
              return res.json({
                "success": false,
                message: "Error in processing your request"
              });
            };
            https.get(result.location, function(httpRes2) {
              var userBody = '';
              httpRes2.on("data", function(songChunk) {
                  userBody += songChunk;
                })
                .on("end", function() {
                  var user = JSON.parse(userBody);
                  User.findOne({
                      'soundcloud.id': user.id
                    })
                    .exec()
                    .then(function(data) {
                      if (!data) {
                        var newUser = new User({
                          'name': user.username,
                          'soundcloud': {
                            'id': user.id,
                            'username': user.username,
                            'permalinkURL': user.permalink_url,
                            'avatarURL': user.avatar_url.replace('large', 't500x500'),
                            'followers': user.followers_count
                          }
                        });
                        newUser.save();
                        res.send([newUser]);
                      } else {
                        res.send([]);
                      }
                    });
                });
            });
          });
        } else {
          res.send([]);
        }
      });
  }
});

// router.post('/syncSCEmails', function(req, res, next) {
//   var sCount = 0;
//   var page = 0;
//   var lCount = 10000;
//   var processEmails = function(skipCount, limitCount) {
//     SCEmails.find({})
//       .skip(skipCount)
//       .limit(limitCount)
//       .exec()
//       .then(function(scemails) {
//         if (scemails.length > 0) {
//           scemails.forEach(function(sce, index) {
//             User.update({
//               'soundcloud.id': sce.soundcloudID
//             }, {
//               $set: {
//                 'soundcloud.followers': sce.followers,
//                 'soundcloud.permalinkURL': sce.soundcloudURL,
//                 'soundcloud.id': sce.soundcloudID,
//                 'soundcloud.username': sce.username,
//                 name: sce.username,
//                 email: sce.email,
//                 queue: []
//               }
//             }, {
//               upsert: true
//             }, function(err, user) {
//               if (index == (scemails.length - 1)) {
//                 page++;
//                 sCount = (page * lCount);
//                 console.log(page + "===" + sCount + "===" + lCount)
//                 processEmails(sCount, lCount)
//               }
//             });
//           });
//         }
//       });
//   }
//   processEmails(sCount, lCount);
// });