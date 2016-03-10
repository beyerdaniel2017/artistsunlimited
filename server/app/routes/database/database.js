'use strict';
var https = require('https');
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Follower = mongoose.model('Follower');
var TrackedUser = mongoose.model('TrackedUser');
var csv = require('csv-write-stream');
var fs = require('fs');
var scConfig = global.env.SOUNDCLOUD;
var SC = require('node-soundcloud');


router.post('/followers', function(req, res, next) {
  if (req.body.password != 'letMeManage') next(new Error('wrong password'));
  var query1 = {};
  if (req.body.query.genre) query1.genre = req.body.query.genre;
  if (req.body.query.trackedUsersURL) query1.scURL = req.body.query.trackedUsersURL;

  var query2 = {};
  if (req.body.query.followers) query2.followers = req.body.query.followers;
  if (req.body.query.artist) query2.artist = req.body.query.artist;
  if (JSON.stringify(query1) == JSON.stringify({})) {
    createAndSendFile(query2, res, next);
  } else {
    TrackedUser.findOne(query1).exec()
      .then(function(usr) {
        if (!usr) next(new Error('Followed account not found.'))
        console.log(usr)
        query2.trackedUsers = {
          $in: [usr._id]
        };
        createAndSendFile(query2, res, next);
      })
      .then(null, next);
  }
});

function createAndSendFile(query, res, next) {
  var writer = csv({
    headers: ["username", "name", "URL", "email", "description", "followers", "# of Tracks", "Facebook", "Instagram", "Twitter", "Youtube"]
  });
  writer.pipe(fs.createWriteStream("tmp/userDBQuery.csv"));
  var stream = Follower.find(query).stream();
  stream.on('data', function(flwr) {
    var row = [flwr.username, flwr.name, flwr.scURL, flwr.email, flwr.description, flwr.followers, flwr.numTracks, flwr.facebookURL, flwr.instagramURL, flwr.twitterURL, flwr.youtubeURL];
    writer.write(row);
  });
  stream.on('close', function() {
    console.log('ended');
    writer.end();
    res.send('ok');
  });
  stream.on('error', next);
}

router.get('/downloadFile', function(req, res, next) {
  res.download('tmp/userDBQuery.csv');
})

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
                  TrackedUser.findOne({
                      "scID": user.id
                    }).exec()
                    .then(function(trdUser) {
                      if (trdUser) {
                        throw new Error('already exists');
                      } else {
                        var tUser = new TrackedUser({
                          scURL: req.body.url,
                          scID: user.id,
                          username: user.username,
                          followers: user.folowers_count,
                          description: user.description
                        });
                        return tUser.save();
                      }
                    }).then(function(followUser) {
                      addFollowers(followUser, '/users/' + followUser.scID + '/followers');
                      res.send(followUser);
                    }).then(null, next);
                })
            })
            .on('error', next)
            .end();
        })
      })
    .on('error', next)
    .end();
});

function addFollowers(followUser, nextURL) {
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.redirectURL
  });
  SC.get(nextURL, {
    limit: 200
  }, function(err, res) {
    if (res.next_href) {
      addFollowers(followUser, res.next_href);
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
          if (youtube) follower.youtubeURL = youtube.url;
        }
        if (follower.description) {
          var myArray = follower.description.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
        } else {
          var myArray = null;
        }
        if (myArray) {
          for (var index in myArray) {
            var email = myArray[index];
            Follower.findOne({
                "scID": follower.id
              }).exec()
              .then(function(flwr) {
                if (flwr && flwr.email == email) {
                  flwr.trackedUsers.push(followUser._id)
                } else {
                  var newFollower = new Follower({
                    artist: follower.track_count > 0,
                    scID: follower.id,
                    scURL: follower.permalink_url,
                    name: follower.full_name,
                    username: follower.username,
                    followers: follower.followers_count,
                    email: email,
                    dayNum: Math.floor(Math.random() * 14) + 1,
                    description: follower.description,
                    numTracks: follower.track_count,
                    facebookURL: follower.facebookURL,
                    instagramURL: follower.facebookURL,
                    twitterURL: follower.twitterURL,
                    youtubeURL: follower.youtubeURL,
                    trackedUsers: [followUser._id]
                  });
                }
                newFollower.save();
              });
          }
        }
      });
    })
  });
}