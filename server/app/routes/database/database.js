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
var sendEmail = require("../../mandrill/sendEmail.js");


router.post('/followers', function(req, res, next) {
  var filename = "QueryDB_" + JSON.stringify(req.body.query) + ".csv";
  if (req.body.password != 'letMeManage') next(new Error('wrong password'));
  var query = {};
  if (req.body.query.genre) query.genre = req.body.query.genre;
  if (req.body.query.followers) query.followers = req.body.query.followers;
  if (req.body.query.artist) query.artist = req.body.query.artist;
  createAndSendFile(filename, query, res, next);
});

function createAndSendFile(filename, query, res, next) {
  var writer = csv({
    headers: ["username", "genre", "name", "URL", "email", "description", "followers", "# of Tracks", "Facebook", "Instagram", "Twitter", "Youtube", "Websites", 'Auto Email Day', 'All Emails']
  });
  writer.pipe(fs.createWriteStream('tmp/' + filename));
  var stream = Follower.find(query).stream();
  stream.on('data', function(flwr) {
    var row = [flwr.username, flwr.genre, flwr.name, flwr.scURL, flwr.email, flwr.description, flwr.followers, flwr.numTracks, flwr.facebookURL, flwr.instagramURL, flwr.twitterURL, flwr.youtubeURL, flwr.websites, flwr.emailDayNum, flwr.allEmails.join(', ')];
    writer.write(row);
  });
  stream.on('close', function() {
    writer.end();
    res.send(filename);
  });
  stream.on('error', next);
}

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
                  console.log(user);
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
                          followers: user.followers_count,
                          description: user.description,
                          genre: req.body.genre
                        });
                        return tUser.save();
                      }
                    }).then(function(followUser) {
                      addFollowers(followUser, '/users/' + followUser.scID + '/followers', req.body.email);
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

function addFollowers(followUser, nextURL, email) {
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.redirectURL
  });
  SC.get(nextURL, {
    limit: 200
  }, function(err, res) {
    if (err) {
      console.log(err);
      sendEmail('Database User', email, 'Email Database', 'coayscue@gmail.com', 'Failed Database Populate', "Database failed to populate followers of " + followUser.username + ". ERROR:" + err.message + ". Please reply to this email to find out why.");
    } else if (res.next_href) {
      addFollowers(followUser, res.next_href, email);
    } else {
      console.log('done');
      sendEmail('Database User', email, 'Email Database', 'coayscue@gmail.com', 'Successful Database Population', "Database has populated followers of " + followUser.username);
    }

    if (res && res.collection) {
      res.collection.forEach(function(follower) {
        SC.get('/users/' + follower.id + '/web-profiles', function(err, webProfiles) {
          follower.websites = '';
          if (webProfiles) {
            for (var index in webProfiles) {
              switch (webProfiles[index].service) {
                case 'twitter':
                  follower.twitterURL = webProfiles[index].url;
                  break;
                case 'instagram':
                  follower.instagramURL = webProfiles[index].url;
                  break;
                case 'facebook':
                  follower.facebookURL = webProfiles[index].url;
                  break;
                case 'youtube':
                  follower.youtubeURL = webProfiles[index].url;
                  break;
                case 'personal':
                  follower.websites += webProfiles[index].url + '\n';
                  break;
              }
            }
          }
          if (follower.description) {
            var myArray = follower.description.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
          } else {
            var myArray = null;
          }
          if (myArray) {
            var email = myArray[0];
            Follower.findOne({
                "scID": follower.id
              }).exec()
              .then(function(flwr) {
                if (!flwr) {
                  var newFollower = new Follower({
                    artist: follower.track_count > 0,
                    scID: follower.id,
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
                    emailDayNum: Math.floor(Math.random() * 14) + 1,
                    websites: follower.websites,
                    genre: followUser.genre,
                    allEmails: myArray
                  });
                }
                newFollower.save();
              });
          }
        });
      })
    }
  });
}

router.post('/trackedUsers', function(req, res, next) {
  TrackedUser.find(req.body.query).exec()
    .then(function(users) {
      var filename = "TrackedUsers_" + JSON.stringify(req.body.query) + ".csv";
      var writer = csv({
        headers: ["username", "URL", "genre", "followers", "description"]
      });
      writer.pipe(fs.createWriteStream('tmp/' + filename));
      users.forEach(function(usr) {
        var row = [usr.username, usr.scURL, usr.genre, usr.followers, usr.description];
        writer.write(row);
      });
      writer.end();
      res.send(filename);
    });
});