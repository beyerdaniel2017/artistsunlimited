var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var request = require('request');
var queryString = require('query-string');
var scClientID = require('./../../../env').SOUNDCLOUD;

router.post('/', function(req, res, next) {
  var query = req.body.search;
  query.client_id = scClientID;
  query.limit = 30;
  if (query.q.includes("soundcloud.com")) {
    (new Promise(function(fulfill, reject) {
      SCResolve({
        url: query.q,
        client_id: scClientID
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
        var sendObj = {
          track: track,
          searchString: query.q,
          collection: []
        }
        res.send(track);
      })
      .then(null, next);
  } else {
    var autocompleteSearch = 'https://api-v2.soundcloud.com/search/autocomplete?' + queryString.stringify(query)
    request.get(autocompeteSearch, function(err, res, autoResults) {
      if (err) console.log(err);
      console.log(autoResults)
      var regularSearch = 'https://api-v2.soundcloud.com/search?' + queryString.stringify(query)
      request.get(regularSearch, function(err, res, regResults) {
        if (err) console.log(err);
        console.log(regResults)
      });
    });
  }
})