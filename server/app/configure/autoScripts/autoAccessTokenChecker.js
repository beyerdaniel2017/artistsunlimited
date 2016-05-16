var mongoose = require('mongoose');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var sendEmail = require('../../mandrill/sendEmail.js');
var scWrapper = require("../../SCWrapper/SCWrapper.js");
var scConfig = require('./../../../env').SOUNDCLOUD;
scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.redirectURL
});

module.exports = checkTokens;
//daily emails
function checkTokens() {
  setTimeout(function() {
    checkTokens()
  }, 7200000);

  User.find({}).exec()
    .then(function(users) {
      users.forEach(function(user) {
        RepostEvent.find({
            userID: user.soundcloud.id,
            completed: false
      })
      .exec()
          .then(function(events) {
            if (events && events.length > 0) {
          scWrapper.setToken(user.soundcloud.token);
          var reqObj = {method: 'GET', path: '/me', qs: {}};
          scWrapper.request(reqObj, function(err, data){
                if (err) {
                  sendEmail(user.soundcloud.username, user.email, "Artists Unlimited", "coayscue@artistsunlimited.co", "Invalid Access Token", "Hey " + user.soundcloud.username + ", <br><br>Your soundcloud access token for Artists Unlimited is invalid and you have some scheduled reposts coming up. Please log back in to <a href='https://artistsunlimited.co/login'>Artist Tools</a> to allow us to fulfill your scheduled reposts: <a href='https://artistsunlimited.co/login'>Artist Tools Login</a><br><br>Best,<br>Christian Ayscue<br>Artists Unlimited");
                }
          });
            }
          })
    });
  });
}