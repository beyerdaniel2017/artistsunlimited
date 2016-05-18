var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');

router.get('/withUser/:userID', function(req, res, next) {
  Trade.find({
      $or: [{
        'p1.user': req.params.userID
      }, {
        'p2.user': req.params.userID
      }]
    }).populate('p1.user').populate('p2.user').exec()
    .then(function(trades) {
      res.send(trades);
    })
    .then(null, next);
});

router.post('/new', function(req, res, next) {
  var trade = new Trade(req.body);
  trade.save()
    .then(function(trade) {
      res.send(trade);
    })
    .then(null, next);
})

router.get('/byID/:tradeID', function(req, res, next) {
  Trade.findById(req.params.tradeID).populate('p1.user').populate('p2.user').exec()
    .then(function(trade) {
      res.send(trade);
    })
    .then(null, next);
})