 var mongoose = require('mongoose');
 var User = mongoose.model('User')
 var messengerAPI = require('../messengerAPI/messengerAPI.js')
 var sendEmail = require('../mandrill/sendEmail.js')

 module.exports = {
   sendNotifications: function(userID, type, heading, message, link) {
     User.findById(userID)
       .then(function(user) {
         User.findOne({
             'paidRepost.userID': userID
           })
           .then(function(adminUser) {
             console.log(adminUser);
             if (adminUser) user = adminUser;
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
       }).then(null, console.log);
   }
 }