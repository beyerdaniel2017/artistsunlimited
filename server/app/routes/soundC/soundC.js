var SC = require('soundclouder');
var HTTP = require('http');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
// var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
// var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";
var router = require('express').Router();
module.exports = router;

router.post('/soundcloudTrack', function(req, res, next) {
  var getPath = '/resolve.json?url=' + req.body.url + '&client_id=' + client_id;
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