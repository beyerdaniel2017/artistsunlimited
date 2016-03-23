var SC = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');

var HTTPS = require('https');
var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;

router.post('/soundcloudTrack', function(req, res, next) {
  SCResolve({
    url: req.body.url,
    client_id: scConfig.clientID
  }, function(err, track) {
    if (err) {
      next(err);
    } else {
      track.trackURL = req.body.url;
      res.send(track);
    }
  });
});

router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});