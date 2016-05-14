'use strict';
var express = require('express');
var https = require('https');
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
var oauth;
var Youtube = require("youtube-api");
var Opn = require("opn");
var router = require('express').Router();
var Promise = require('bluebird');
var request = require('request');
var qs = require('qs');
var config = require("./../config.js");

module.exports = router;

var mongoose = require('mongoose');
var DownloadTrack = mongoose.model('DownloadTrack');
var User = mongoose.model('User');
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');

var Channel = mongoose.model('Channel');


router.get('/track', function(req, res, next) {
  DownloadTrack.findById(req.query.trackID).exec()
    .then(function(downloadTrack) {
      res.send(downloadTrack);
    })
    .then(null, next);
});

router.post('/tasks', function(req, res, next) {
  var body = req.body;
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.callbackURL,
    accessToken: body.token
  });
  SCR.init(scConfig.clientID, scConfig.clientSecret, scConfig.callbackURL);

  if (body.like) {
    SC.put('/me/favorites/' + body.trackID, function(err, response) {
      if (err) console.log('error liking: ' + JSON.stringify(err));
    });
  }
  if (body.repost) {
    SCR.put('/e1/me/track_reposts/' + body.trackID, body.token, function(err, data) {
      if (err) console.log('error reposting the track2: ' + JSON.stringify(err));
    });
  }
  if (body.comment) {
    SCR.get('/tracks/' + body.trackID, body.token, function(err, data) {
      if (err) console.log(err);
      else {
        var timestamp = Math.floor((Math.random() * data.duration));
        SCR.post('/tracks/' + body.trackID + '/comments', body.token, {
          'comment[body]': body.commentText,
          'comment[timestamp]': timestamp
        }, function(err, data) {
          if (err) console.log('error commenting: ' + JSON.stringify(err));
        });
      }
    });
  }
  if (body.artists) {
    body.artists.forEach(function(artist) {
      SC.put('/me/followings/' + artist.id, function(err, response) {
        if (err) console.log('error following added artist: ' + JSON.stringify(err));
      });
    });
  }
  if (body.userid) {
    User.findOne({
      _id: body.userid
    }).exec().then(function(user) {
      user.permanentLinks.forEach(function(artist) {
        SC.put('/me/followings/' + artist.id, function(err, response) {
          if (err) console.log('error following a permanet: ' + JSON.stringify(err));
        });
      });
    });
  }
  if (body.artistID) {
    SC.put('/me/followings/' + body.artistID, function(err, response) {
      if (err) console.log('error following main artist: ' + JSON.stringify(err));
    });
  }
  if (body.playlists) {
    body.playlists.forEach(function(playlist) {
      SCR.put('/e1/me/playlist_reposts/' + playlist.id, body.token, function(err, data) {
        if (err) console.log('error reposting a playlist: ' + JSON.stringify(err))
      });
      SCR.put('/e1/me/playlist_likes/' + playlist.id, body.token, function(err, data) {
        if (err) console.log('error liking a playlist: ' + JSON.stringify(err))
      });
    });
  }
  SCR.put('/e1/me/track_reposts/' + body.trackID, body.token, function(err, data) {
    if (err) console.log('error reposting the track: ' + JSON.stringify(err));
  });
  DownloadTrack.findById(body._id).exec()
    .then(function(t) {
      if (t.downloadCount) t.downloadCount++;
      else t.downloadCount = 1;
      t.save();
      res.end();
    })
});


//   function findUserByIdSAndSaveTrack(t) {


//     if (!t.artists) {
//       t.artists = [];
//     }
//     User
//       .findById(body.userid)
//       .exec()
//       .then(function(user) {
//         user.permanentLinks.forEach(function(link) {
//           SC.put('/me/followings/' + link.id, function(err, response) {
//             if (err) console.log('error following: ' + JSON.stringify(err));
//           });
//           var exists = t.artists.some(function(artist) {
//             return link.id === artist.id;
//           });
//           if (!exists) {
//             t.artists.push(link);
//           }
//         });
//         return t.save();
//       })
//       .then(null, function() {
//         return Promise.resolve();
//       });
//   }

//   function findUser() {
//     return new Promise(function(resolve, reject) {
//       if (req.user) {
//         return resolve();
//       } else {
//         SC.get('/me', function(err, data) {
//           if (err) {
//             resolve();
//           }
//           User
//             .findOne({
//               'soundcloud.id': data.id
//             })
//             .exec()
//             .then(function(user) {
//               if (user) {
//                 resolve();
//               } else {
//                 resolve(data);
//               }
//             })
//             .then(null, function(err) {
//               resolve();
//             });
//         });
//       }
//     });
//   }

//   function createUser(data) {
//     if (data) {
//       var newUser = new User({
//         'name': data.username,
//         'soundcloud': {
//           'id': data.id,
//           'username': data.username,
//           'permalinkURL': data.permalink_url,
//           'avatarURL': data.avatar_url,
//           'token': body.token
//         }
//       });
//       newUser.save();
//       return res.end();
//     } else {
//       return res.end();
//     }
//   }
// });



router.get('/track/recent', function(req, res, next) {
  var userID = req.query.userID;
  var trackID = req.query.trackID;
  DownloadTrack.find({
      userid: userID
    }).sort({
      createdOn: -1
    }).limit(6).exec()
    .then(function(downloadTracks) {
      var tracks = downloadTracks.filter(function(item) {
        return item._id.toString() !== trackID;
      });
      res.send(tracks);
      return res.end();
    })
    .then(null, next);
});

router.post("/instagram/follow_user",function(req,res,done){

  var access_token = req.body.access_token;
  var accessTokenUrl = 'https://api.instagram.com/v1/users/search?q='+req.body.q+'&access_token='+access_token+'&count=1';

    var params = {
      
    };

    request.get({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {

      if(body.data.length > 0)
      {

          request.post({ url: 'https://api.instagram.com/v1/users/'+body.data[0].id+'/relationship?access_token='+access_token, form: { 'action' : 'follow' }, json: true }, function(error, response, body) {

            if(body.data.outgoing_status && body.data.outgoing_status == "requested") {
              res.json({ 'succ' : true });
            }
            else
            {
              res.json({ 'succ' : false , 'msg' : 'error following instagram user.'});
            }

          });

      }
      else
      {
        res.json({ 'succ' : false , 'msg' : 'instagram user not found'});
      }
    
    });

});

router.post('/auth/instagram', function(req, res, done)
{
    var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';

    var params = {
      client_id: req.body.clientId,
      redirect_uri: req.body.redirectUri,
      client_secret: '2fb6196d81064e94a8877285779274d6',
      code: req.body.code,
      grant_type: 'authorization_code'
    };

    request.post({ url: accessTokenUrl, form: params, json: true }, function(error, response, body) {

      // console.log(response);

      res.json(response.body.access_token);
    
    });
});


// For Twitter API

router.post("/twitter/auth",function(req,res,done){

    console.log('working');
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var profileUrl = 'https://api.twitter.com/1.1/users/lookup.json?screen_name=';
    var followUrl = 'https://api.twitter.com/1.1/friendships/create.json?screen_name=';
    
    // Part 1 of 2: Initial request from Satellizer.
    if (!req.body.oauth_token || !req.body.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
        consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
        callback: req.body.redirectUri
      };

      // Step 1. Obtain request token for the authorization popup.
      request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
        var oauthToken = qs.parse(body);

        // Step 2. Send OAuth token back to open the authorization screen.
        // res.send(oauthToken);
        console.log("###########oauthToken##########");
        console.log(oauthToken);
        console.log("###########oauthToken##########");
        res.send(oauthToken);
      });
    } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      var accessTokenOauth = {
        consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
        consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
        token: req.body.oauth_token,
        verifier: req.body.oauth_verifier
      };

      request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

        accessToken = qs.parse(accessToken);

            console.log("###########accessToken##########");
            console.log(accessToken);
            console.log("###########accessToken##########");
            
            var profileOauthData = {
              consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
              consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
              oauth_token: accessToken.oauth_token
            };

              var followReqURL = followUrl + 'dhavalpvrin&follow=true';
              request.post({
                url: followReqURL,
                oauth: profileOauthData
              }, function(err, response, follow) {
                  
                  console.log(follow);
              });

        });
     
    }
});


router.post("/twitter/post",function(req,res,done){

    
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var profileUrl = 'https://api.twitter.com/1.1/users/lookup.json?screen_name=';      // is this required
    var tweetUrl = 'https://api.twitter.com/1.1/statuses/update.json?status=';
    
    // Part 1 of 2: Initial request from Satellizer.
    if (!req.body.oauth_token || !req.body.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
        consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
        callback: req.body.redirectUri
      };

      // Step 1. Obtain request token for the authorization popup.
      request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
        var oauthToken = qs.parse(body);

        // Step 2. Send OAuth token back to open the authorization screen.
        // res.send(oauthToken);
        console.log("###########oauthToken##########");
        console.log(oauthToken);
        console.log("From post API")
        console.log("###########oauthToken##########");
        res.send(oauthToken);
      });
    } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      var accessTokenOauth = {
        consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
        consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
        token: req.body.oauth_token,
        verifier: req.body.oauth_verifier
      };

      request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

        accessToken = qs.parse(accessToken);

            console.log("###########accessToken##########");
            console.log(accessToken);
            console.log("###########accessToken##########");
            
            var profileOauthData = {
              consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
              consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
              oauth_token: accessToken.oauth_token
            };

              var tweetReqURL = tweetUrl + 'Thisisatesttweetdhavalpvrin';
              request.post({
                url: tweetReqURL,
                oauth: profileOauthData
              }, function(err, response, tweet) {
                  
                  console.log(tweet);
              });

        });
     
    }
});


// For Twitter

router.post('/auth/twitter', function(req, res) {

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
      consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
      callback: req.body.redirectUri
    };

    request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
      var oauthToken = qs.parse(body);

      res.send(oauthToken);

    });

  } else {

    var accessTokenOauth = {
      consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
      consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

      accessToken = qs.parse(accessToken);

      var profileOauth = {
        consumer_key: 'FZnc1o9Srv8V3VpU46FCctRXx',
        consumer_secret: 'ufRdSMLtduuDGGAGHVjRYQJrNblXsZvRwvGlQebdBz0W5FWD8U',
        oauth_token: accessToken.oauth_token
      };

      request.post({
        url: profileUrl + 'dhavalpvrin',
        oauth: profileOauth,
        json: true
      }, function(err, response, profile) {

        });
    });
  }
});


// THIS PORTION IS NEWLY ADDED

// For Youtube


router.get("/callbacksubscribe", function (req, res, next)
{
    oauth.getToken(req.query.code, function (err, tokens)
    {
        if (err) {

        }
        oauth.setCredentials(tokens);
        /*
         * Youtube subscribed to channel
         */

        var options = {
            uri: 'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet',
            method: 'POST',
            json: {
                "snippet": {
                    "resourceId": {
                        "channelId": req.session.channelID,
                        "kind": "youtube#channel"
                    }
                }
            },
            headers: {
                "Authorization": "Bearer " + tokens.access_token
            }
        };

        request(options, function (error, response, body)
        {
            if (!error && response.statusCode == 200)
            {
                res.redirect(req.session.trackURL);
            }

            if(error) {
                res.send("You have error in subscribing to user. You will not be redirected to downloading track");
            }
        });

        /*
         * Youtube subscribed to channel
         */

    });

});

router.get("/subscribe", function (req, res, next)
{
    var trackURL = req.query.trackURL;
    var channelID = req.query.channelID;
    
    req.session.trackURL = trackURL;
    req.session.channelID = channelID;
    oauth = Youtube.authenticate({
        type: "oauth"
        , client_id: config.CLIENT_ID
        , client_secret: config.CLIENT_SEC
        , redirect_url: config.REDIRECT_URL_SUBSCRIBE
    });


    Opn(oauth.generateAuthUrl({
        access_type: "offline"
        , scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtubepartner", "https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.force-ssl"]
    }));

    res.json({msg : "Redirected to youtube authentication"});
});