'use strict';
var https = require('https');
var router = require('express').Router();
var url = require('url');
router.use('/autoEmails', require('./autoEmails/autoEmails.js'))
module.exports = router;
var mongoose = require('mongoose');
var Follower = mongoose.model('Follower');
var TrackedUser = mongoose.model('TrackedUser');
var DownloadTrack = mongoose.model('DownloadTrack');
var PaidRepostAccount = mongoose.model('PaidRepostAccount');
var csv = require('csv-write-stream');
var fs = require('fs');
var scConfig = global.env.SOUNDCLOUD;
var SC = require('node-soundcloud');
var sendEmail = require("../../mandrill/sendEmail.js");
var emitter = require('./../../../io/emitter.js');
var objectAssign = require('object-assign');

router.post('/adduser', function(req, res, next) {
  // if (req.body.password != 'letMeManage') next(new Error('wrong password'));
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
      sendEmail('Database User', email, 'Email Database', 'coayscue@gmail.com', 'SUCCESSFUL Database Population', "Database has populated followers of " + followUser.username);
    } else if (res.next_href) {
      addFollowers(followUser, res.next_href, email);
    } else {
      sendEmail('Database User', email, 'Email Database', 'coayscue@gmail.com', 'SUCCESSFUL Database Population', "Database has populated followers of " + followUser.username);
    }
    if (res && res.collection) {
      var i = -1;
      var collectionLength = res.collection.length
      insertFollowers();

      function insertFollowers() {
        i++;
        if (i < collectionLength) {
          var follower = res.collection[i];
          SC.get('/users/' + follower.id + '/web-profiles', function(err, webProfiles) {
            follower.websites = '';
            if (!err) {
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
                    newFollower.save();
                  }
                  emitter.emit('notification', {
                    "counter": i + 1,
                    "total": collectionLength
                  });
                  insertFollowers();
                });
            } else {
              emitter.emit('notification', {
                "counter": i + 1,
                "total": collectionLength
              });
              insertFollowers();
            }
          });
        }
      }
    }
  });
}

router.post('/followers', function(req, res, next) {
  var queryStr = JSON.stringify(req.body.query);
  queryStr = queryStr.replace(/\//g, '');
  var filename = "QueryDB_" + queryStr + ".csv";
  // if (req.body.password != 'letMeManage') next(new Error('wrong password'));
  var query = {};
  if (req.body.query.genre) query.genre = req.body.query.genre;
  if (req.body.query.followers) query.followers = req.body.query.followers;
  if (req.body.query.artist) query.artist = req.body.query.artist;
  if (req.body.query.columns) {
    query.columns = req.body.query.columns;
  } else {
    query.columns = [];
  }
  console.log(query.columns, 'query.columns');
  createAndSendFile(filename, query, res, next);
});

function createAndSendFile(filename, query, res, next) {
  var writer = csv({
    headers: ["username", "genre", "name", "URL", "email", "description", "followers", "# of Tracks", "Facebook", "Instagram", "Twitter", "Youtube", "Websites", 'Auto Email Day', 'All Emails']
  });
  var headerObj = {
    'username': 'username',
    'genre': 'genre',
    'name': 'name',
    'scURL': 'URL',
    'email': 'email',
    'description': 'description',
    'followers': 'followers',
    'numTracks': '# of Tracks',
    'facebookURL': 'Facebook',
    'instagramURL': 'Instagram',
    'twitterURL': 'Twitter',
    'youtubeURL': 'Youtube',
    'websites': 'Websites',
    'emailDayNum': 'Auto Email Day',
    'allEmails': 'All Emails'
  };

  var columns = query.columns; 
  delete query.columns;

  var headers = [];
  for (var prop in headerObj) {
    if (columns.indexOf(prop) > -1) {
      headers.push(headerObj[prop]);
    }
  }
  var writer = csv({
    headers: headers
  });
  writer.pipe(fs.createWriteStream('tmp/' + filename));
  var stream = Follower.find(query).stream();
  // stream.on('data', function(flwr) {
  //   var row = [flwr.username, flwr.genre, flwr.name, flwr.scURL, flwr.email, flwr.description, flwr.followers, flwr.numTracks, flwr.facebookURL, flwr.instagramURL, flwr.twitterURL, flwr.youtubeURL, flwr.websites, flwr.emailDayNum, flwr.allEmails.join(', ')];
  //   writer.write(row);
  // });
  stream.on('data', function(flwr) {
    var row = [];
    columns.forEach(function(elm) {
      if (elm === 'allEmails') {
        row.push(flwr[elm].join(''));
      } else {
        row.push(flwr[elm]);
      }
    });
    console.log(row);
    writer.write(row);
  });
  stream.on('close', function() {
    writer.end();
    res.send(filename);
  });
  stream.on('error', next);
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

router.post('/downloadurl', function(req, res, next) {

  var body = req.body;

  var downloadTrack = new DownloadTrack({
    trackUrl: body.trackUrl,
    downloadUrl: body.downloadUrl,
    email: body.email
  });
  downloadTrack.save();
  var urlObj = url.parse(req.url);
  var trackUrl = req.protocol + '://' + req.get('host') + '/download?trackid=' + downloadTrack._id;
  var html = '<p>Hello! Here is your download URL - </p><a href="' + trackUrl + '">Download</a>';
  sendEmail('Service', body.email, 'Artists Unlimited', 'support@artistsunlimited.co', 'Download Track', html);
  return res.end();
});


router.post('/paidrepost', function(req, res, next) {

  var body = req.body;
  var getPath = '/resolve.json?url=' + body.soundCloudUrl + '&client_id=' + scConfig.clientID;
  var userObj = {};
  getLocation()
    .then(resolveData)
    .then(findPaidRepostAccount)
    .then(savePaidRepostAccount)
    .then(function() {
      return res.end();
    })
    .catch(next);


  function getLocation() {
    return new Promise(function(resolve, reject) {
      var httpReq = https.get({
        host: 'api.soundcloud.com',
        path: getPath,
      }, function(httpRes) {
        var location = '';
        var locationData = {};
        httpRes.on('data', function(locationChunk) {
          location += locationChunk;
        });
        httpRes.on('end', function() {
          try {
            locationData = JSON.parse(location);
          } catch (err) {
            console.log('err1', err);
            reject(err);
          }
          console.log('locationData', locationData);
          resolve(locationData.location);
        });
      });
      httpReq.on('error', function(err) {
        console.log('err2', err);
        reject(err);
      });
    });
  }

  function resolveData(location) {
    return new Promise(function(resolve, reject) {
      var httpReq = https.get(location, function(httpRes) {
        var user = '';
        var userData = {};
        httpRes.on('data', function(userChunk) {
          user += userChunk;
        });
        httpRes.on('end', function() {
          try {
            userData = JSON.parse(user);
          } catch (err) {
            reject(err);
          }
          userObj = userData; // Setting up global variable userObj for this route to be used in savePaidRepostAccount() function
          resolve(userData);
        });
      });
      httpReq.on('error', function(err) {
        reject(err);
      });
    });
  }

  function findPaidRepostAccount(user) {
    return PaidRepostAccount.findOne({
      'scID': user.id
    }).exec();
  }

  function savePaidRepostAccount(paidRepostAccount) {
    if (paidRepostAccount) {
      return Promise.reject(new Error('Account already exists'));
    }
    var newPaidRepostAccount = new PaidRepostAccount({
      scURL: req.body.url,
      scID: userObj.id,
      username: userObj.username,
      followers: userObj.followers_count,
      description: userObj.description
    });

    return newPaidRepostAccount.save();
  }


});