'use strict';

var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var scConfig = global.env.SOUNDCLOUD;
var SC = require('node-soundcloud');

module.exports = function(app) {

    var strategyFn = function(req, email, password, done) {
        SC.init({
            id: scConfig.clientID,
            secret: scConfig.clientSecret,
            uri: scConfig.callbackURL,
            accessToken: req.body.token
        });
        SC.get('/me', function(err, data) {
            if (err) {
              return done(err, false);
            }   
            User.findOne({ 'soundcloud.id': data.id }).exec()
            .then(function (user) {
                if (user) {
                    var updateObj = {
                        'soundcloud' : {
                            'id': data.id,
                            'username': data.username,
                            'permalinkURL': data.permalink_url,
                            'avatarURL': data.avatar_url,
                            'token' : req.body.token
                        }
                    };
                    User.findOneAndUpdate({ _id: user._id }, { $set : updateObj }, { new: true }).exec()
                    .then(function(user) {
                        done(null, user);    
                    })
                    .then(null, function(err) {
                        done(err);
                    });
                    
                } else {
                    var newUser = new User({
                        'name': data.username,
                        'soundcloud': {
                            'id': data.id,
                            'username': data.username,
                            'permalinkURL': data.permalink_url,
                            'avatarURL': data.avatar_url,
                            'token' : req.body.token
                        }
                    });
                    newUser.save();
                    return done(null, newUser);
                }

            }, function(err) {
                done(err);
            });
        });
    };

    passport.use('local-soundcloud', new LocalStrategy({
        usernameField: 'token',
        passwordField: 'password',
        passReqToCallback: true
    }, strategyFn));
};