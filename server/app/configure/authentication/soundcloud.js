'use strict';
var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var scConfig = global.env.SOUNDCLOUD;
var scWrapper = require("../../SCWrapper/SCWrapper.js");
scWrapper.init({
    id: scConfig.clientID,
    secret: scConfig.clientSecret,
    uri: scConfig.callbackURL
});

module.exports = function(app) {
    var strategyFn = function(req, email, password, done) {
        scWrapper.setToken(req.body.token);
        var reqObj = {
            method: 'GET',
            path: '/me',
            qs: {}
        };
        scWrapper.request(reqObj, function(err, data) {
            if (err) {
                return done(err, false);
            }
            User.findOne({
                    'soundcloud.id': data.id
                })
                .then(function(user) {
                    if (user) {
                        var updateObj = {
                            'soundcloud': {
                                'id': data.id,
                                'username': data.username,
                                'permalinkURL': data.permalink_url,
                                'avatarURL': data.avatar_url.replace('large', 't500x500'),
                                'token': req.body.token,
                                'followers': data.followers_count,
                                'pseudoname': data.username.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
                            }
                        };
                        User.findOneAndUpdate({
                                _id: user._id
                            }, {
                                $set: updateObj
                            }, {
                                new: true
                            })
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
                                'avatarURL': data.avatar_url.replace('large', 't500x500'),
                                'token': req.body.token,
                                'followers': data.followers_count,
                                'pseudoname': data.username.replace(/[^a-zàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœA-Z0-9 ]/g, "").replace(/ /g, "_")
                            },
                            'role': 'user'
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