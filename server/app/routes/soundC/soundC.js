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
  // http.request({
  //     host: 'pure-beyond-79652.herokuapp.com',
  //     path: '/api/soundcloud/resolve',
  //     method: 'POST'
  //   }, function(response) {
  //     var str = ''
  //     response.on('data', function(chunk) {
  //       str += chunk.toString();
  //       console.log(chunk);
  //     });
  //     response.on('end', function() {
  //       console.log('ay');
  //       console.log('here');
  //       // var obj = JSON.parse(str);
  //       res.send(str);
  //     });
  //     response.on('error', function(err) {
  //       console.log(err);
  //     });
  //   })
  //   .on('error', next)
  //   .end();

});


router.get('/soundcloudConfig', function(req, res, next) {
  res.send(scConfig);
});