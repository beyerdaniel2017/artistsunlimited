var router = require('express').Router();
module.exports = router;
var scConfig = global.env.SOUNDCLOUD;
var http = require('http');
var request = require('request');
var SCResolve = require('soundcloud-resolve-jsonp/node');


router.post('/soundcloudTrack', function(req, res, next) {
  request.post({
    url: 'http://pure-beyond-79652.herokuapp.com/api/soundcloud/resolve',
    form: {
      url: req.body.url
    }
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var track = JSON.parse(body);
      track.trackURL = req.body.url;
      res.send(track); // Show the HTML for the Google homepage. 
    } else {
      console.log(error)
    }
  });

});


router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});