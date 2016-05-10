var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;
var https = require('https');
var request = require('request');
var scWrapper = require("../../SCWrapper/SCWrapper.js");

scWrapper.init({
  id: scConfig.clientID,
  secret: scConfig.clientSecret,
  uri: scConfig.callbackURL
    });

router.post('/resolve', function(req, res, next) {
  var reqObj = {method: 'GET', path: '/resolve.json', qs: {url: req.body.url}};
  scWrapper.request(reqObj, function(err, result){
    https.get(result.location, function(httpRes2) {
      var trackBody = '';
      httpRes2.on("data", function(songChunk) {
        trackBody += songChunk;
      })
      .on("end", function() {
        var track = JSON.parse(trackBody);
      track.trackURL = req.body.url;
      res.send(track);
});
    });    
  });
});

// router.post('/resolve', function(req, res, next) {
//   (new Promise(function(fulfill, reject) {
//     SCResolve({
//       url: req.body.url,
//       client_id: scConfig.clientID
//     }, function(err, track) {
//       if (err) {
//         reject(err);
//       } else {
//         fulfill(track);
//       }
//     });
//   }))
//   .then(function(track) {
//       track.trackURL = req.body.url;
//       res.send(track);
//     })
//     .then(null, next);
// });


router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});