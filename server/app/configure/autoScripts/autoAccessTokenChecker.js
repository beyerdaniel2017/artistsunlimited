var mongoose = require('mongoose');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var sendEmail = require('../../mandrill/sendEmail.js');
var SCR = require('soundclouder');
var scConfig = global.env.SOUNDCLOUD;
SCR.init(scConfig.clientID, scConfig.clientSecret, scConfig.redirectURL);

module.exports = checkTokens;

//daily emails
function checkTokens() {
  setTimeout(function() {
    checkTokens()
  }, 86400000);

  User.find({}).exec()
    .then(function(users) {
      users.forEach(function(user) {
        RepostEvent.find({
            userID: user.soundcloud.id,
            completed: false
          }).exec()
          .then(function(events) {
            if (events && events.length > 0) {
              SCR.get('/me', user.soundcloud.accessToken, function(err, data) {
                console.log(data);
                if (err) {
                  sendEmail(user.soundcloud.username, user.email, "Artists Unlimited", "coayscue@artistsunlimited.com", "Access Token Invalid", "Hey " + user.soundcloud.username + ", <br><br>Your access token is invalid, and we see that you have some scheduled reposts coming up. Please log back in to <a href='https://artistsunlimited.co/login'>Artist Tools</a> or your scheduled reposts will not occur.<br><br>Best,<br>Christian Ayscue<br>Artists Unlimited");
                }
              })
            }
          })
      })
    })
}