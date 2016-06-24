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
module.exports = router;

var mongoose = require('mongoose');
var DownloadTrack = mongoose.model('DownloadTrack');
var User = mongoose.model('User');
var env = require('./../../../env');
var scConfig = require('./../../../env').SOUNDCLOUD;
var sendEmail = require('../../mandrill/sendEmail.js');
var scWrapper = require("../../SCWrapper/SCWrapper.js");
var Channel = mongoose.model('Channel');
var SCEmails = mongoose.model('SCEmails');


scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.callbackURL
});

router.get('/track', function(req, res, next) {
  DownloadTrack.findById(req.query.trackID).exec()
    .then(function(downloadTrack) {
      res.send(downloadTrack);
    })
    .then(null, next);
});

router.post('/tasks', function(req, res, next) {
  var body = req.body;
  scWrapper.setToken(body.token);
  var reqObj = {};
  if (body.like) {
    scWrapper.request({
      method: 'PUT',
      path: '/me/favorites/' + body.trackID,
      qs: {
        oauth_token: body.token
      }
    }, function(err, response) {
      if (err) console.log('error liking: ' + JSON.stringify(err));
    });
  }
  if (body.repost) {
    scWrapper.request({
      method: 'PUT',
      path: '/e1/me/track_reposts/' + body.trackID,
      qs: {
        oauth_token: body.token
      }
    }, function(err, response) {
      if (err) console.log('error reposting the track: ' + JSON.stringify(err));
    });
  }
  if (body.comment) {
    scWrapper.request({
      method: 'GET',
      path: '/tracks/' + body.trackID,
      qs: {
        oauth_token: body.token
      }
    }, function(err, data) {
      if (err) console.log(err);
      else {
        var timestamp = Math.floor((Math.random() * data.duration));
        scWrapper.request({
          method: 'POST',
          path: '/tracks/' + body.trackID + '/comments',
          qs: {
            oauth_token: body.token,
            'comment[body]': body.commentText,
            'comment[timestamp]': timestamp
          }
        }, function(err, data) {
          if (err) console.log('error commenting: ' + JSON.stringify(err));
        });
      }
    });
  }
  if (body.artists) {
    body.artists.forEach(function(artist) {
      scWrapper.request({
        method: 'PUT',
        path: '/me/followings/' + artist.id,
        qs: {
          oauth_token: body.token
        }
      }, function(err, response) {
        if (err) console.log('error following added artist: ' + JSON.stringify(err));
      });
    });
  }
  if (body.userid) {
    User.findOne({
      _id: body.userid
    }).exec().then(function(user) {
      user.permanentLinks.forEach(function(artist) {
        scWrapper.request({
          method: 'PUT',
          path: '/me/followings/' + artist.id,
          qs: {
            oauth_token: body.token
          }
        }, function(err, response) {
          if (err) console.log('error following a permanet: ' + JSON.stringify(err));
        });
      });
    });
  }
  if (body.artistID) {
    scWrapper.request({
      method: 'PUT',
      path: '/me/followings/' + body.artistID,
      qs: {
        oauth_token: body.token
      }
    }, function(err, response) {
      if (err) console.log('error following main artist: ' + JSON.stringify(err));
    });
  }
  if (body.playlists) {
    body.playlists.forEach(function(playlist) {
      scWrapper.request({
        method: 'PUT',
        path: '/e1/me/playlist_reposts/' + playlist.id,
        qs: {
          oauth_token: body.token
        }
      }, function(err, data) {
        if (err) console.log('error reposting a playlist: ' + JSON.stringify(err))
      });
      scWrapper.request({
        method: 'PUT',
        path: '/e1/me/playlist_likes/' + playlist.id,
        qs: {
          oauth_token: body.token
        }
      }, function(err, data) {
        if (err) console.log('error liking a playlist: ' + JSON.stringify(err))
      });
    });
  }
  DownloadTrack.findById(body._id).exec()
    .then(function(t) {
      if (t.downloadCount) t.downloadCount++;
      else t.downloadCount = 1;
      t.save();
      res.end();
    })
});

router.get('/track/recent', function(req, res, next) {
  var userID = req.query.userID;
  var trackID = req.query.trackID;
  DownloadTrack.find({
      userid: userID
    }).sort({
      createdOn: -1
    }).limit(10).exec()
    .then(function(downloadTracks) {
      var tracks = downloadTracks.filter(function(item) {
        return item._id.toString() !== trackID;
      });
      res.send(tracks);
      return res.end();
    })
    .then(null, next);
});

router.post('/linkDLTracks', function(req, res, next) {
  DownloadTrack.find({}).exec()
    .then(function(tracks) {
      tracks.forEach(function(track) {
        User.findOneAndUpdate({
          'soundcloud.id': track.artistID
        }, {
          $set: {
            'soundcloud.permalinkURL': track.artistURL,
            'soundcloud.id': track.artistID,
            'soundcloud.username': track.artistUsername,
            name: track.artistUsername,
            queue: []
          }
        }, {
          new: true,
          upsert: true
        }, function(err, user) {
          console.log("------------")
          track.userid = user._id;
          track.save();
          console.log(user);
          console.log(track);

        });
      })
    })
});

router.post("/instagram/follow_user", function(req, res, done) {

  var access_token = req.body.access_token;
  var accessTokenUrl = 'https://api.instagram.com/v1/users/search?q=' + req.body.q + '&access_token=' + access_token + '&count=1';

  var params = {

  };

  request.get({
    url: accessTokenUrl,
    form: params,
    json: true
  }, function(error, response, body) {

    if (body.data.length > 0) {
      request.post({
        url: 'https://api.instagram.com/v1/users/' + body.data[0].id + '/relationship?access_token=' + access_token,
        form: {
          'action': 'follow'
        },
        json: true
      }, function(error, response, body) {

        if (body.data.outgoing_status && body.data.outgoing_status == "requested") {
          res.json({
            'succ': true
          });
        } else {
          res.json({
            'succ': false,
            'msg': 'error following instagram user.'
          });
        }

      });

    } else {
      res.json({
        'succ': false,
        'msg': 'instagram user not found'
      });
    }
  });
});

router.post('/auth/instagram', function(req, res, done) {
  var accessTokenUrl = 'https://api.instagram.com/oauth/access_token';
  var params = {
    client_id: env.INSTAGRAM.clientID,
    client_secret: env.INSTAGRAM.clientSecret,
    redirect_uri: env.INSTAGRAM.callbackUrl,
    code: req.body.code,
    grant_type: 'authorization_code'
  };
  request.post({
    url: accessTokenUrl,
    form: params,
    json: true
  }, function(error, response, body) {
    res.json(response.body.access_token);
  });
});


// For Twitter API

router.post("/twitter/auth", function(req, res, done) {

  var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
  //var accessTokenUrl = 'https://api.twitter.com/oauth2/token';
  var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
  var profileUrl = 'https://api.twitter.com/1.1/users/lookup.json?screen_name=';

  // Part 1 of 2: Initial request from Satellizer.
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var requestTokenOauth = {
      consumer_key: env.TWITTER.consumerKey,
      consumer_secret: env.TWITTER.consumerSecret,
      callback: env.TWITTER.callbackUrl,
    };

    // Step 1. Obtain request token for the authorization popup.
    request.post({
      url: requestTokenUrl,
      oauth: requestTokenOauth
    }, function(err, response, body) {
      var oauthToken = qs.parse(body);
      res.send(oauthToken);
    });
  } else {
    // Part 2 of 2: Second request after Authorize app is clicked.
    var accessTokenOauth = {
      consumer_key: env.TWITTER.consumerKey,
      consumer_secret: env.TWITTER.consumerSecret,
      token: req.body.oauth_token,
      verifier: req.body.oauth_verifier
    };

    request.post({
      url: accessTokenUrl,
      oauth: accessTokenOauth
    }, function(err, response, accessToken) {
      if (!err) {
        //console.log(req.header('Authorization'));
        accessToken = qs.parse(accessToken);
        res.send(accessToken);
      } else {
        console.log("Error from twitter callbacks" + err);
      }
    });

  }
});

router.post("/twitter/follow", function(req, res, done) {
  //console.log("request body <downloadTracks.js>:"+"\n"+JSON.stringify(req.params)+"\n"+JSON.stringify(req.body)+"\n"+JSON.stringify(req.query));
  var followUrl = 'https://api.twitter.com/1.1/friendships/create.json?screen_name=' + req.body.screen_name;
  var profileOauthData = {
    consumer_key: env.TWITTER.consumerKey,
    consumer_secret: env.TWITTER.consumerSecret,
    token: req.body.accessToken.oauth_token,
    token_secret: req.body.accessToken.oauth_token_secret
  };
  request.post({
    url: followUrl,
    oauth: profileOauthData
  }, function(err, response, follow) {
    if (!err) {
      res.send(follow);
    } else {
      console.log("Error from twitter oauth login attempt " + err);
    }
  });
});

router.post("/twitter/post", function(req, res, done) {
  var profileOauthData = {
    consumer_key: env.TWITTER.consumerKey,
    consumer_secret: env.TWITTER.consumerSecret,
    token: req.body.oauth_token,
    token_secret: req.body.oauth_token_secret
  };
  var tweetUrl = 'https://api.twitter.com/1.1/statuses/update.json?status=';
  var tweetReqURL = tweetUrl + encodeURIComponent(req.body.socialPlatformValue);
  request.post({
    url: tweetReqURL,
    oauth: profileOauthData
  }, function(err, response, tweet) {
    if (!err) {
      console.log(tweet);
      res.send(tweet);
    } else {
      done(err);
    }
  });
});
// For Twitter

// For Youtube
router.get("/callbacksubscribe", function(req, res, next) {

  oauth.getToken(req.query.code, function(err, tokens) {
    if (err) {
      next(err);
    }
    console.log(tokens);
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

    request(options, function(error, response, body) {
      console.log(response.statusCode);
      console.log(body);
      if (!error && response.statusCode == 200) {
        res.redirect(req.session.trackURL);
      }
      if (error) {
        res.send("You have error in subscribing to user. You will not be redirected to downloading track");
      }
    });
  });
});

router.get("/subscribe", function(req, res, next) {
  var trackURL = req.query.trackURL;
  var channelID = req.query.channelID;

  req.session.trackURL = trackURL;
  req.session.channelID = channelID;
  oauth = Youtube.authenticate({
    type: "oauth",
    client_id: env.YOUTUBE.CLIENT_ID,
    client_secret: env.YOUTUBE.CLIENT_SEC,
    redirect_url: env.YOUTUBE.REDIRECT_URL_SUBSCRIBE
  });

  Opn(oauth.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtubepartner", "https://www.googleapis.com/auth/youtube", "https://www.googleapis.com/auth/youtube.force-ssl"]
  }));

  res.json({
    msg: "Redirected to youtube authentication"
  });
});