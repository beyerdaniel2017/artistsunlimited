var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var RepostEvent = mongoose.model('RepostEvent');

router.get('/withUser/:userID', function(req, res, next) {
  Trade.find({
      $or: [{
        'p1.user': req.params.userID
      }, {
        'p2.user': req.params.userID
      }]
    }).populate('p1.user').populate('p2.user').exec()
    .then(function(trades) {
    var tradesResult = [];
    var i = -1;
    if(trades.length > 0){
      var next = function() {
        i++;
        if(i < trades.length) {
          var t = trades[i].toJSON();
          if(t.p1.user && t.p2.user){
        t.unfilledTrackCount = 0;
        var ownerid = (t.p1.user._id.toString() === req.user._id.toString() ? t.p1.user._id : t.p2.user._id);
        var userid = (t.p1.user._id.toString() === req.user._id.toString() ? t.p2.user.soundcloud.id : t.p1.user.soundcloud.id);
        RepostEvent.count({
          day: {$gt: new Date()}, 
          owner: ownerid, 
          userID: userid, 
          trackID:{$exists: false},
          type: 'traded'
        })
        .exec()
        .then(function(events) {
          t.unfilledTrackCount = events;
          tradesResult.push(t);
              next();
            });
          }
          else{
            next();
          }
        }
        else{
            res.send(tradesResult);
          }
        }
      next();
    }
    else{
      res.send([]);
    }    
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

router.put('/', function(req, res, next) {
  Trade.findByIdAndUpdate(req.body._id, req.body, {
      new: true
    }).populate('p1.user').populate('p2.user').exec()
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

router.post('/delete', function(req, res, next) {
  var body = req.body;
  Trade
  .remove({
    _id: body.id
  })
  .exec()
  .then(function() {
    return res.end();
  })
  .then(null, function(err) {
    next(err);
  });
});