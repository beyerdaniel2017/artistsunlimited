var mongoose = require('mongoose');
var Submission = mongoose.model('Submission');
var sendEmail = require('../../mandrill/sendEmail.js');

module.exports = doPoolSent;
//executes every 5 min
function doPoolSent() {
  setTimeout(function() {
    doPoolSent();
  }, 300000);
  var currentDate = new Date(); 
  Submission.find({
    $where: "this.pooledChannelIDS.length > 0",
    pooledSendDate: {
      $lte: currentDate
    },
    status: 'pooled'
  })
  .populate('userID')
  .exec()
  .then(function(submissions) {
    submissions.forEach(function(sub) {
      sendMessage(sub);
    })
  })
  .then(null, function(err) {
    console.log(err);
  });
}

function sendMessage(sub) {
  if (sub.email && sub.name) {
    sendEmail('virendra', 'virendra.chouhan@linkites.com', "Edward Sanchez", "feedback@peninsulamgmt.com", "Pool Send", "Hey " + sub.name + ",<br><br> Status updated to poolSent");
    Submission.findByIdAndUpdate(sub._id, {status: 'poolSent'})
    .exec()
    .then(function(sub) {
    })
  }
}
