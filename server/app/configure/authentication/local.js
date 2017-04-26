'use strict';
var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app) {

  // When passport.authenticate('local') is used, this function will receive
  // the email and password to run the actual authentication logic.
  var strategyFn = function(email, password, done) {
    User.findOne({
        email: email,
        "$or": [{
          "role": "superadmin"
        }, {
          "role": "admin"
        }]
      })
      .then(function(user) {
        // user.correctPassword is a method from the User schema.
        // if (!user || !user.correctPassword(password)) {
        if (!user || !user.correctPassword(password)) {
          done(null, false);
        } else {
          // Properly authenticated.
          done(null, user);
        }
      }, function(err) {
        done(err);
      });
  };

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, strategyFn));

  

};
