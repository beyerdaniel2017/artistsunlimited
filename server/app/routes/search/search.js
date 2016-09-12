var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var request = require('request');
var queryString = require('query-string');
var scClientID = require('./../../../env').SOUNDCLOUD.clientID;
var SCResolve = require('soundcloud-resolve-jsonp/node');

router.post('/', function(req, res, next) {
  if (req.body.q.includes("soundcloud.com")) {
    resolveURL(req.body.q)
      .then(function(item) {
        var sendObj = {
          item: item,
          searchString: req.body.q,
          collection: []
        }
        res.send(sendObj);
      })
      .then(null, next);
  } else {
    var query = {
      q: req.body.q,
      client_id: scClientID,
      limit: 30
    };
    var autocompleteSearch = 'https://api-v2.soundcloud.com/search/autocomplete?' + queryString.stringify(query);
    console.log(autocompleteSearch);
    request.get(autocompleteSearch, function(err, response, autoResults) {
      if (err) console.log(err);
      var autoResults = JSON.parse(autoResults).results.filter(function(obj) {
        return obj.kind == req.body.kind;
      })

      Promise.all(autoResults.slice(0, 5).map(function(result) {
        return resolveURL(result.entity.permalink_url)
          .then(function(item) {
            return item;
          })
          .then(null, next);
      })).then(function(autoResults) {
        var regularSearch = 'https://api-v2.soundcloud.com/search?' + queryString.stringify(query)
        request.get(regularSearch, function(err, response, regResults) {
          if (err) console.log(err);
          var regResults = JSON.parse(regResults).collection.filter(function(obj) {
            return obj.kind == req.body.kind;
          })
          var searchArray = autoResults.concat(regResults.slice(0, 20));
          var sendObj = {
            searchString: query.q,
            collection: searchArray
          }
          res.send(sendObj);
        });
      })
    });
  }
})

function resolveURL(url) {
  return (new Promise(function(fulfill, reject) {
    SCResolve({
      url: url,
      client_id: scClientID
    }, function(err, item) {
      if (err) {
        reject(err);
      } else {
        fulfill(item);
      }
    });
  }))
}