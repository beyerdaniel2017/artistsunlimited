'use strict';
var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Channel = mongoose.model('Channel');
var Submission = mongoose.model('Submission');
var Event = mongoose.model('Event');
var User = mongoose.model('User');
var SC = require('node-soundcloud');
var passport = require('passport');
var https = require('https');
var request = require('request');
var scConfig = global.env.SOUNDCLOUD;

router.post('/', function(req, res, next) {
  passport.authenticate('local-login', function(err, user, info) {
    if (err) {
      return res.json({
        success: false,
        "message": err
      });
    }
    if (!user) {
      return res.json({
        success: false,
        "message": "Invalid Username or Password"
      });
    } else {
      req.login(user, function(err) {
        //if(req.body.rememberme && (req.body.rememberme == "1" || req.body.rememberme == 1)){
        req.session.cookie.expires = false;
        req.session.name = user.userid;
        req.session.cookie.expires = new Date(Date.now() + (28 * 24 * 3600000));
        req.session.cookie.maxAge = 28 * 24 * 3600000;
        req.session.cookie.expires = false;
        delete user.password;
        delete user.salt;
        return res.json({
          'success': true,
          'message': '',
          'user': user
        });
      });
    }
  })(req, res);
});

router.post('/authenticated', function(req, res, next) {
  SC.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.callbackURL,
    accessToken: req.body.token
  });
  SC.get('/me', function(err, data) {
    if (err) {
      next(err);
    } else {
      var sendObj = {};
      Channel.findOneAndUpdate({
          channelID: data.id
        }, {
          accessToken: req.body.token
        }).exec()
        .then(function(channel) {
          sendObj.channel = channel;
          return Event.find({
            channelID: data.id
          }).exec();
        })
        .then(function(events) {
          sendObj.events = events;
          return Submission.find({
            channelIDS: data.id
          }).exec();
        })
        .then(function(submissions) {
          sendObj.submissions = submissions;
          res.send(sendObj);
        })
        .then(null, next);
    }
  });
});

router.post('/soundCloudLogin', function(req, res, next) {
  passport.authenticate('local-soundcloud', function(err, user, info) {
    console.log(err, user, info)
    if (err) {
      return res.json({
        success: false,
        "message": err
      });
    }
    if (!user) {
      return res.json({
        success: false,
        "message": "Error in processing your request"
      });
    } else {
          req.login(user, function(err) {
          req.session.cookie.expires = false;
          req.session.name = user.userid;
          req.session.cookie.expires = new Date(Date.now() + (28 * 24 * 3600000));
          req.session.cookie.maxAge = 28 * 24 * 3600000;
        req.session.cookie.expires = false;
          return res.json({
            'success': true,
          'message': '',
            'user': user
          });
        });
    }
  })(req, res);
});
/*
Client Secrets
Google -
{
client id:923811958466-kthtaatodor5mqq0pf5ub6km9msii82g.apps.googleusercontent.com
client secret:K4wliD3PsnjdS0o-CKTNokjv
}
*/
router.post('/google', function(req, res, next) {
    request.post({
        url: 'https://www.googleapis.com/oauth2/v4/token',
        form: {
            code: req.body.code,
            client_id: '923811958466-kthtaatodor5mqq0pf5ub6km9msii82g.apps.googleusercontent.com',
            client_secret: 'K4wliD3PsnjdS0o-CKTNokjv',
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        }
    }, function(err, response, body_token) {
      if(err) return console.log("<google,login.js>Error while getting access token from code :"+JSON.stringify(err));
      //create entries into database under users authorization table
      body_token=JSON.parse(body_token);
      request.get({
        url:'https://www.googleapis.com/youtube/v3/channels?part=contentOwnerDetails,brandingSettings,contentDetails&mine=true&access_token='+body_token.access_token
      },function(err,response,body){
        //prompt user to select an appropiate channel
          if(err) return console.log("<google,login.js>Error while getting statistics from Google API :"+JSON.stringify(err));
          body=JSON.parse(body);
          body_token.isValid=false;
          var AuthTokens=mongoose.model("AuthTokens");
          AuthTokens.update({
            userid:req.user._id
          },{
            userid:req.user._id,
            youtube:body_token
          },{
            upsert:true
          },function(err,nMod){
            if(err) return console.log("<google,login.js>Error while pushing access tokens to database"+JSON.stringify(err));
            var channels={};
            for(var i=0; i<body.items.length; i++){
              channels[body.items[i].id]=body.items[i].brandingSettings.channel.title;
            }
            res.send(channels);
          });
      });
    });
});
