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
  var User = mongoose.model('User');
  var PaidRepostAccount = mongoose.model('PaidRepostAccount');
  var csv = require('csv-write-stream');
  var fs = require('fs');
  var scConfig = global.env.SOUNDCLOUD;
  var SC = require('node-soundcloud');
  var SCR = require('soundclouder');
  var sendEmail = require("../../mandrill/sendEmail.js");
  var emitter = require('./../../../io/emitter.js');
  var objectAssign = require('object-assign');
  var AWS = require('aws-sdk');
  var awsConfig = require('./../../../env').AWS;
  var Busboy = require('busboy');
  var Channel = mongoose.model('Channel');
  var Promise = require('bluebird');
  var SCResolve = require('soundcloud-resolve-jsonp/node');
  var request = require('request');
  var rootURL = require('./../../../env').ROOTURL;


  var id3 = require('id3-writer');
  var writer = new id3.Writer();

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
        sendEmail('Database User', email, 'Email Database', 'coayscue@artistsunlimited.co', 'SUCCESSFUL Database Population', "Database has populated followers of " + followUser.username);
      } else if (res.next_href) {
        addFollowers(followUser, res.next_href, email);
      } else {
        sendEmail('Database User', email, 'Email Database', 'coayscue@artistsunlimited.co', 'SUCCESSFUL Database Population', "Database has populated followers of " + followUser.username);
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
    createAndSendFile(filename, query, res, next);
  });

  function createAndSendFile(filename, query, res, next) {
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
    stream.on('data', function(flwr) {
      var row = [];
      columns.forEach(function(elm) {
        if (elm === 'allEmails') {
          row.push(flwr[elm].join(''));
        } else {
          row.push(flwr[elm]);
        }
      });
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
    if (req.user) {
      parseMultiPart()
        .then(checkIfFile)
        .then(saveDownloadTrack)
        .then(updateSoundCloudTrackInfo)
        .then(sendMailAndAddPermanentLinksToAdmin)
        .then(handleResponse)
        .then(null, function(err) {
          console.log(err, 'err');
          next(err);
        });
    } else {
      return res.send('Error in processing your request');
    }
    var body = {
      fields: {},
      file: null,
      location: ''
    };

    function parseMultiPart() {
      return new Promise(function(resolve, reject) {
        var busboy = new Busboy({
          headers: req.headers,
          limits: {
            fileSize: 20 * 1024 * 1024,
            files: 1
          }
        });
        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

          var buffer = new Buffer('');
          var type = mimetype.split('/')[1];
          var newfilename = (filename.substr(0, filename.lastIndexOf('.')) || filename) + '_' + Date.now().toString() + '.' + type;
          var mp3Stream = fs.createWriteStream('tmp/' + newfilename);

          file.pipe(mp3Stream);

          file.on('limit', function() {
            reject('Error: File size cannot be more than 20 MB');
          });

          file.on('end', function() {
            mp3Stream.end();
            body.file = {
              fieldname: fieldname,
              buffer: buffer,
              filename: filename,
              newfilename: newfilename,
              encoding: encoding,
              mimetype: mimetype
            };
          });
        });
        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
          body.fields[fieldname] = val;
        });
        busboy.on('finish', function() {
          resolve();
        });
        busboy.on('error', function(err) {
          reject(err);
        });
        req.pipe(busboy);
      });
    }

    function checkIfFile() {
      return new Promise(function(resolve, reject) {
        if (body.file) {
          uploadToBucket()
            .then(function(result) {
              body.location = result.Location;
              console.log(result.Location);
              resolve();
            })
            .catch(function(err) {
              reject(err);
            });
        } else {
          resolve();
        }
      });
    }

    function uploadToBucket() {
      return new Promise(function(resolve, reject) {
        AWS.config.update({
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        });

        console.log('getting image');
        var artworkimageURL = "";
        if (body.fields.trackArtworkURL == "") artworkimageURL = body.fields.artistArtworkURL
        else artworkimageURL = body.fields.trackArtworkURL;
        var imageStream = fs.createWriteStream('tmp/' + body.file.newfilename + '.jpg');

        https.get(artworkimageURL, function(res) {
          res.pipe(imageStream);
          res.on('end', function() {
            imageStream.end();
            var mp3 = new id3.File('tmp/' + body.file.newfilename);
            console.log(mp3);
            var coverImage = new id3.Image("tmp/" + body.file.newfilename + ".jpg");
            console.log(body);
            var meta = new id3.Meta({
              artist: body.fields.artistUsername,
              title: body.fields.trackTitle,
              album: 'ArtistsUnlimited.co'
            }, [coverImage]);


            writer.setFile(mp3).write(meta, function(err) {
              if (err) {
                reject(err);
              }
              fs.unlink("tmp/" + body.file.newfilename + ".jpg");
              fs.readFile("tmp/" + body.file.newfilename, function(err, data) {
                var data = {
                  Key: body.file.newfilename,
                  Body: data,
                  ContentType: body.file.mimetype,
                  ContentDisposition: 'attachment'
                };
                fs.unlink("tmp/" + body.file.newfilename);
                var s3 = new AWS.S3({
                  params: {
                    Bucket: awsConfig.bucketName
                  }
                });
                s3.upload(data, function(err, data) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(data);
                  }
                });
              })
            });
          });
        });
      });
    }

    function saveDownloadTrack() {
      var SMLinks = JSON.parse(body.fields.SMLinks);
      var artists = JSON.parse(body.fields.artists);
      body.fields.SMLinks = SMLinks;
      body.fields.artists = artists;
      if (body.fields.playlists) {
        body.fields.playlists = JSON.parse(body.fields.playlists);
      }
      body.fields.userid = req.user._id;
      body.fields.downloadURL = (body.location !== '') ? body.location : body.fields.downloadURL;
      if (body.fields._id) {
        return DownloadTrack.findOneAndUpdate({
          _id: body.fields._id
        }, body.fields, {
          new: true
        });
      }
      var downloadTrack = new DownloadTrack(body.fields);
      return downloadTrack.save();
    }

    function updateSoundCloudTrackInfo(downloadTrack) {
      return new Promise(function(resolve, reject) {
        if (req.user && req.user.soundcloud && (String(body.fields.artistID) === req.user.soundcloud.id) && !body.fields._id) {
          var token = req.user.soundcloud.token;
          var trackObj = {
            purchase_url: rootURL + '/download?trackid=' + downloadTrack._id,
            purchase_title: '|| D O W N L O A D'
          };
          trackObj.description = body.fields.description + '\n\nDownload for ' + downloadTrack.trackTitle + ' provided by ' + rootURL + '.';

          console.log(trackObj);
          request({
            method: 'PUT',
            url: 'https://api.soundcloud.com/tracks/' + downloadTrack.trackID + '?oauth_token=' + token,
            json: {
              track: trackObj
            }
          }, function(err, response, data) {
            if (err) {
              console.log(err, 'err');
              return resolve(downloadTrack);
            }
            console.log(data);
            return resolve(downloadTrack);
          });
        } else {
          return resolve(downloadTrack);
        }
      });
    }

    function sendMailAndAddPermanentLinksToAdmin(downloadTrack) {
      var trackUrl = req.protocol + '://' + req.get('host') + '/download?trackid=' + downloadTrack._id;
      var html = '<p>Here is your download URL: - </p><span>' + trackUrl + '</span>';
      sendEmail('Service', req.user.email, 'Artists Unlimited', 'coayscue@artistsunlimited.co', 'Download Track', html);
      return addPermanentLinksToAdmin(trackUrl);
    }

    function addPermanentLinksToAdmin(trackUrl) {
      return new Promise(function(resolve, reject) {

        if (req.user && req.user.role === 'admin') {
          Channel
            .find({})
            .exec()
            .then(function(channels) {
              var promises = [];
              channels.forEach(function(channel) {
                if (channel.displayName !== 'Supportify') {
                  promises.push(resolveTrack(channel.url));
                }
              });
              var track = null;
              var permanentLinks = req.user.permanentLinks;
              Promise.settle(promises).then(function(results) {
                results.forEach(function(result) {
                  if (result.isFulfilled()) {
                    track = result.value();
                    var exists = req.user.permanentLinks.some(function(link) {
                      return track.id === link.id;
                    });
                    if (!exists) {
                      permanentLinks.push({
                        url: track.permalink_url,
                        avatar: track.avatar_url,
                        username: track.username,
                        id: track.id,
                        permanentLink: true
                      });
                    }
                  }
                });
                User
                  .update({
                    _id: req.user._id
                  }, {
                    $addToSet: {
                      permanentLinks: {
                        $each: permanentLinks
                      }
                    }
                  })
                  .exec()
                  .then(function() {
                    resolve(trackUrl);
                  })
                  .then(null, function(err) {
                    reject(err);
                  });
              });
            })
            .then(null, function(err) {
              return reject(err);
            });
        } else {
          return resolve(trackUrl);
        }

      });
    }

    function resolveTrack(url) {
      return new Promise(function(resolve, reject) {
        SCResolve({
          url: url,
          client_id: scConfig.clientID
        }, function(err, track) {
          if (err || !track) {
            return reject();
          }
          return resolve(track);
        });
      });
    }

    function handleResponse(trackUrl) {
      return res.end(trackUrl);
    }

  });

  router.get('/downloadurl/admin', function(req, res, next) {
    DownloadTrack
      .find({})
      .exec()
      .then(function(tracks) {
        res.send(tracks);
      })
      .then(null, function(err) {
        next(err);
      });
  });

  router.post('/downloadurl/delete', function(req, res, next) {
    var body = req.body;
    DownloadTrack
      .remove({
        _id: body.id
      })
      .exec()
      .then(function() {
        return res.end();
      })
      .then(null, function(err) {
        next(err);
      });
  });

  router.get('/downloadurl/:id', function(req, res, next) {

    var downloadTrackID = req.params.id;
    DownloadTrack
      .findById(downloadTrackID)
      .then(function(track) {
        res.send(track);
      })
      .then(null, function(err) {
        next(err);
      });
  });

  router.get('/downloadurl', function(req, res, next) {

    DownloadTrack
      .find({
        userid: req.user._id
      })
      .sort({
        createdOn: -1
      })
      .then(function(tracks) {
        res.send(tracks);
      })
      .then(null, function(err) {
        next(err);
      });
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
              reject(err);
            }
            resolve(locationData.location);
          });
        });
        httpReq.on('error', function(err) {
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

  router.post('/profile/edit', function(req, res, next) {

    var body = req.body;
    var updateObj = {};
    if (body.name !== '') {
      updateObj.name = body.name;
    } else if (body.password !== '') {
      updateObj.salt = User.generateSalt();
      updateObj.password = User.encryptPassword(body.password, updateObj.salt);
    } else if (body.email !== '') {
      updateObj.email = body.email;
    }

    try {
      updateObj.permanentLinks = JSON.parse(body.permanentLinks);
    } catch (err) {
      next(err);
    }

    if (req.user) {
      if (updateObj.email) {
        User.findOne({
          'email': updateObj.email
        }, function(err, result) {
          if (err) {
            next(err);
          } else if (result) {
            return res.send('Email Error');
          } else {
            updateUser();
          }
        });
      }
    }

    function updateUser() {
      User.findOneAndUpdate({
        '_id': req.user._id
      }, {
        $set: updateObj
      }, {
        new: true
      }, function(err, result) {
        if (err) {
          next(err);
        } else {
          return res.send(JSON.stringify(result));
        }
      });
    }
  });

  router.post('/profile/soundcloud', function(req, res, next) {

    var body = req.body;

    if (req.user) {
      getUserSCInfo()
        .then(checkIfUser)
        .then(updateUser)
        .then(sendResponse)
        .then(null, handleError);
    } else {
      return res.json({
        "success": false,
        "message": "User is not logged in. Please try again.",
        "data": null
      });
    }


    function getUserSCInfo() {
      return new Promise(function(resolve, reject) {
        SC.init({
          id: scConfig.clientID,
          secret: scConfig.clientSecret,
          uri: scConfig.callbackURL,
          accessToken: body.token
        });
        SC.get('/me', function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    }

    function checkIfUser(data) {
      return new Promise(function(resolve, reject) {
        User.findOne({
          'soundcloud.id': data.id
        }, function(err, user) {
          if (err) {
            return reject(err);
          } else if (user) {
            return reject('You already have an account with this soundcloud username');
          } else {
            return resolve(data);
          }
        });
      });
    }

    function updateUser(data) {
      var updateObj = {
        'id': data.id,
        'username': data.username,
        'permalinkURL': data.permalink_url,
        'avatarURL': data.avatar_url,
        'token': body.token
      };
      return User.findOneAndUpdate({
        '_id': req.user._id
      }, {
        $set: {
          soundcloud: updateObj
        }
      }, {
        new: true
      }).exec();
    }

    function sendResponse(user) {
      return res.json({
        "success": true,
        "message": "Success",
        "data": user
      });
    }

    function handleError(err) {
      return res.json({
        "success": false,
        "message": err.toString(),
        "data": null
      });
    }



  });