var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var EmailTemplate = mongoose.model("EmailTemplate");

router.post('/biweekly', function(req, res, next) {
  var update = req.body;
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  update.reminderDay = (day % 14) + 1;
  EmailTemplate.findOneAndUpdate({
      purpose: "Biweekly Email",
      isArtist: req.body.isArtist
    }, update, {
      upsert: true
    }).exec()
    .then(function(template) {
      res.send(template);
    })
    .then(null, next);
});

router.get('/biweekly', function(req, res, next) {
  var isArtist = true;
  if(req.query.isArtist === "false") {
    isArtist = false;
  }
  EmailTemplate.findOne({
      purpose: "Biweekly Email",
      isArtist: isArtist
    }).exec()
    .then(function(template) {
      res.send(template);
    })
    .then(null, next);
})