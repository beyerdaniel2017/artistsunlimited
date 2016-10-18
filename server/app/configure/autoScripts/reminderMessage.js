var mongoose = require('mongoose');
var User = mongoose.model('User');
var messengerAPI = require('../../messengerAPI/messengerAPI.js');


module.exports = sendReminder;

function sendReminder() {
  setTimeout(function() {
    sendReminder();
  }, 3600000);
  User.find({
    'notificationSettings.facebookMessenger.lastMessageDate': {
      $or: [{
        $lt: (new Date()).getTime() - 21 * 3600000,
        $gt: (new Date()).getTime() - 22 * 3600000
      }, {
        $lt: (new Date()).getTime() - 24 * 3600000,
        $gt: (new Date()).getTime() - 25 * 3600000
      }]
    }
  }).then(function(users) {
    users.forEach(function(user) {
      User.findOne({
          'paidRepost.userID': user._id
        })
        .then(function(adminUser) {
          if (!adminUser) {
            messengerAPI.quickReplies(user.messengerID, 'Hey, would you like to receive notifications for the next 24 hours?', [{
              content_type: "text",
              title: "Yes",
              payload: "OPTIN YES"
            }]);
          }
        });
    });
  })
}