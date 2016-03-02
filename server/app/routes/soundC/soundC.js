var SC = require('soundclouder');
var HTTP = require('http');
var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;

router.post('/soundcloudTrack', function(req, res, next) {
  var getPath = '/resolve.json?url=' + req.body.url + '&client_id=' + scConfig.clientID;
  HTTP.request({
        host: 'api.soundcloud.com',
        path: getPath,
      },
      function(httpRes) {
        httpRes.on("data", function(chunk) {

          var chunkString = "" + chunk;
          var userID = chunkString.slice(chunkString.indexOf('/tracks/') + 8, chunkString.indexOf('.json?'));
          if (chunkString.includes("404")) {
            next(new Error('song not found'));
          } else {
            res.send({
              trackID: userID
            });
          }
        });
      })
    .on('error', next)
    .end();
});