'use strict';
var https = require('https');
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Follower = mongoose.model('Follower');
var TrackedUser = mongoose.model('TrackedUser');

var scConfig = global.env.SOUNDCLOUD;
var SC = require('soundclouder');

router.post('/adduser', function(req, res, next) {
  if (req.body.password != 'letMeManage') next(new Error('wrong password'));
  var getPath = '/resolve.json?url=' + req.body.url + '&client_id=' + scConfig.clientID;
  https.request({
        host: 'api.soundcloud.com',
        path: getPath,
      },
      function(httpRes) {
        httpRes.on("data", function(locationChunk) {
          var locData = JSON.parse(locationChunk.toString());
          https.get(locData.location, function(httpRes2) {
              var userBody = '';
              httpRes2.on("data", function(songChunk) {
                  userBody += songChunk;
                })
                .on("end", function() {
                  var user = JSON.parse(userBody);
                  SC.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);
                  SC.put('/aaas/users/' + user.id, function(err, res) {
                    console.log(res);
                    console.log(err);
                  });
                  // TrackedUser.findOne({
                  //     "soundcloudID": user.id
                  //   }).exec()
                  //   .then(function(trdUser) {
                  //     if (trdUser) {
                  //       throw new Error('already exists');
                  //     } else {
                  //       var tUser = new TrackedUser({
                  //         soundcloudURL: req.body.url,
                  //         soundcloudID: user.id,
                  //         username: user.username,
                  //         followers: user.folowers_count,
                  //         description: user.description
                  //       });
                  //       return tUser.save();
                  //     }
                  //   }).then(function(followUser) {
                  //     addFollowers(followUser._id, '/users/' + followUser.soundcloudID + '/followers');
                  //     res.send(followUser);
                  //   }).then(null, next);
                })
            })
            .on('error', next)
            .end();
        })
      })
    .on('error', next)
    .end();

  // SC.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);

});

function addFollowers(followUserID, nextURL) {
  SC.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);
  SC.get(nextURL, {
    limit: 200
  }, function(err, res) {
    console.log(err);
    if (res.next_href) {
      addFollowers(followUserID, res.next_href);
    }
    res.collection.forEach(function(follower) {
      SC.get('/users/' + follower.id + '/web-profiles', function(err, webProfs) {
        if (webProfs) {
          var twitter = webProfs.findOne(function(element) {
            return element.service == 'twitter'
          });
          if (twitter) follower.twitterURL = twitter.url;
          var instagram = webProfs.findOne(function(element) {
            return element.service == 'instagram'
          });
          if (instagram) follower.instagramURL = instagram.url;
          var facebook = webProfs.findOne(function(element) {
            return element.service == 'facebook'
          });
          if (facebook) follower.facebookURL = facebook.url;
          var youtube = webProfs.findOne(function(element) {
            return element.service == 'youtube'
          });
          if (youtube) follower.youtubeUrl = youtube.url;
        }
        if (follower.description) {
          var myArray = follower.description.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
        } else {
          var myArray = null;
        }
        if (myArray) {
          for (var index in myArray) {
            var email = myArray[index];
            var newFollower = new Follower({
              artist: follower.track_count > 0,
              soundcloudID: follower.id,
              scURL: follower.permalink_url,
              name: follower.full_name,
              username: follower.username,
              followers: follower.followers_count,
              email: email,
              description: follower.description,
              numTracks: follower.track_count,
              facebookURL: follower.facebookURL,
              instagramURL: follower.facebookURL,
              twitterURL: follower.twitterURL,
              youtubeURL: follower.youtubeURL,
              trackedUser: followUserID
            });
            newFollower.save();
            console.log(newFollower);
          }
        }
      });
    })
  });
}