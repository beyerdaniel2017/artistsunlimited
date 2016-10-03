var mongoose = require('mongoose');
var User = mongoose.model('User')
var messengerAPI = require('../messengerAPI/messengerAPI.js')
var sendEmail = require('../mandrill/sendEmail.js')

module.exports = {
  sendNotifications: function(userID, type, heading, message, link) {
    //if user belongs to an admin, use the admins settings
    User.findById(userID)
      .then(function(user) {
        if (user.notificationSettings.facebookMessenger[type]) {
          messengerAPI.buttons(user.notificationSettings.messengerID, heading + ':\n' + message, [{
            type: "web_url",
            url: link,
            title: "View"
          }]);
        }
        if (user.notificationSettings.email[type]) {
          sendEmail(user.soundcloud.username, user.notificationSettings.email.email, 'Artists Unlimited Server', 'coayscue@artistsunlimited.co', subject, message + '<br><br><h3><a href=' + link + '>View on artistsunlimited.com</a></h3>');
        }
      })
  }
}