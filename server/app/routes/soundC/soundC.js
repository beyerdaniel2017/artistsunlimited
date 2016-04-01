var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;
var http = require('http');
var request = require('request');
var SCResolve = require('soundcloud-resolve-jsonp/node');


router.post('/resolve', function(req, res, next) {
  (new Promise(function(fulfill, reject) {
    SCResolve({
      url: req.body.url,
      client_id: scConfig.clientID
    }, function(err, track) {
      if (err) {
        reject(err);
      } else {
        fulfill(track);
      }
    });
  }))
  .then(function(track) {
      track.trackURL = req.body.url;
      res.send(track);
    })
    .then(null, next);
});


router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});