var SC = require('soundclouder');
var HTTPS = require('https');
var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;

router.post('/soundcloudTrack', function(req, res, next) {
  var getPath = '/resolve.json?url=' + req.body.url + '&client_id=' + scConfig.clientID;
  HTTPS.request({
        host: 'api.soundcloud.com',
        path: getPath,
      },
      function(httpRes) {
        httpRes.on("data", function(locationChunk) {
          var locData = JSON.parse(locationChunk.toString());
          HTTPS.get(locData.location, function(httpRes) {
              var songBody = '';
              httpRes.on("data", function(songChunk) {
                  songBody += songChunk;
                })
                .on("end", function() {
                  var track = JSON.parse(songBody);
                  track.trackURL = req.body.url;
                  res.send(track);
                })
            })
            .on('error', next)
            .end();
        });
      })
    .on('error', next)
    .end();
});

router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});