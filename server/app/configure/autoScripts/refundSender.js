var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var User = mongoose.model('User');
var RepostEvent = mongoose.model('RepostEvent');
var sendEmail = require('../../mandrill/sendEmail.js');
var paypalCalls = require('../../payPal/paypalCalls.js');

module.exports = sendRefunds;
//executes every hour
function sendRefunds() {
  setTimeout(function() {
    sendRefunds();
  }, 2 * 60 * 60 * 1000);
  Submission.find({
    refundDate: {
      $lt: new Date(),
      $gt: (new Date()).getTime() - 2 * 60 * 60 * 1000
    }
  }).then(function(submissions) {
    console.log(JSON.stringify(submissions));
    return submissions.forEach(function(submission) {
      var refundArray = []
      if (submission.payment) refundArray.push(refund(submission.payment.transactions[0].related_resources[0].sale.id));
      if (submission.pooledPayment) refundArray.push(refund(submission.pooledPayment.transactions[0].related_resources[0].sale.id));
      Promise.all(refundArray)
        .then(null, function(err) {
          sendEmail('Christian Ayscue', 'coayscue@gmail.com', "Artists Unlimited", "coayscue@artistsunlimited.com", "Error refunding", "Error: " + JSON.stringify(err) + "\n Submission: " + JSON.stringify(submisison));
        })
      submission.refundDate = new Date(0);
      submission.save();
    })
  }).then(null, console.log);
}

function refund(saleID) {
  return RepostEvent.find({
      saleID: saleID,
      completed: false,
      day: {
        $lt: new Date()
      },
      payout: null
    })
    .then(function(repostEvents) {
      if (repostEvents.length > 0) {
        var paymentRefundTotal = 0;
        var channelList = "<br>";
        repostEvents.forEach(function(event) {
          paymentRefundTotal += event.price;
          User.findOne({
            'soundcloud.id': event.userID
          }).then(function(user) {
            channelList += user.soundcloud.username + "<br>"
          })
        })
        return paypalCalls.sendRefund(paymentRefundTotal, saleID)
          .then(function(refund) {
            repostEvents.forEach(function(event) {
              event.payout = refund;
              event.save();
            })
            sendEmail(repostEvents[0].name, repostEvents[0].email, "Artists Unlimited", "coayscue@artistsunlimited.com", "Refund", "Hello " + repostEvents.name + ",<br><br>Due to an issue with repostinge have refunded your PayPal account the amount of $" + paymentRefundTotal + " for the reposts of " + repostEvents[0].title + " on:" + cannelList + "<br> These reposts have also been rescheduled.<br><br><a href='https://artistsunlimited.com'>Artists Unlimited</a>")
          })
      }
    })
}