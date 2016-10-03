var mongoose = require('mongoose');
var User = mongoose.model('User')
var messengerAPI = require('../messengerAPI/messengerAPI.js')
var sendEmail = require('../mandrill/sendEmail.js')

module.exports = {
  sendNotifications: function(userID, type, heading, message, link) {
<<<<<<< HEAD
    console.log(userID)
    console.log(type)
    console.log(heading)
    console.log(message)
    console.log(link)
=======
    //if user belongs to an admin, use the admins settings
>>>>>>> e9b44817d8c9853113fb4a9a8004a1c34b011b08
    User.findById(userID)
      .then(function(user) {
        console.log(user);
        if (user.notificationSettings.facebookMessenger[type]) {
          messengerAPI.buttons(user.notificationSettings.facebookMessenger.messengerID, heading + ':\n' + message, [{
              type: "web_url",
              url: link,
              title: "View"
            }])
            .then(console.log, console.log);
        }
        if (user.notificationSettings.email[type]) {
          sendEmail(user.soundcloud.username, user.email, 'Artists Unlimited Server', 'coayscue@artistsunlimited.co', heading, message + '<br><br><h3><a href=' + link + '>View on artistsunlimited.com</a></h3>')
        }
      }).then(null, console.log);
  }
}