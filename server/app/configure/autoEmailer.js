var sendEmail = require('../mandrill/sendEmail.js');
var mongoose = require('mongoose');
var Follower = mongoose.model('Follower');
var EmailTemplate = mongoose.model('EmailTemplate')

module.exports = sendAutoEmails;

//daily emails
function sendAutoEmails() {
  setTimeout(function() {
    sendAutoEmails()
  }, 86400000);

  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  var dayNum = (day % 14) + 1;

  EmailTemplate.find({
    purpose: "Biweekly Email"
  }).then(function(template) {
    Follower.find({
        emailDayNum: dayNum
      }).exec()
      .then(function(followers) {
        followers.forEach(function(follower) {
          follower.allEmails.forEach(function(emailAddress) {
            sendEmail(follower.username, emailAddress, template.fromName, template.fromEmail, template.subject, template.htmlMessage);
          })
        });
      });

    if (template.reminderDay == dayNum) {
      sendEmail(template.fromName, template.fromEmail, "Email Server", "coayscue@gmail.com", "Reminder to Change Biweekly Email", "Hey " + template.fromName + ", <br><br>You haven 't changed the bi-weekly email in 2 weeks. <br><br>Sincerely,<br>Your Biweekly Email Server");
    }
  });
}