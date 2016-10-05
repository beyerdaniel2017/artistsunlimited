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
    Promise.all([acSearch(req.body.q, req.body.kind), regSearch(req.body.q, req.body.kind)])
      .then(function(results) {
        var searchArray = results[0].concat(results[1]);
        var sendObj = {
          searchString: req.body.q,
          collection: searchArray
        }
        res.send(sendObj);
      }).then(null, next)
  }
})


function acSearch(q, kind) {
  var acQuery = {
    q: q,
    client_id: scClientID,
    limit: 10
  };
  return (new Promise(function(fulfill, reject) {
    var autocompleteSearch = 'https://api-v2.soundcloud.com/search/autocomplete?' + queryString.stringify(acQuery);
    request.get(autocompleteSearch, function(err, response, body) {
      if (err) reject(err);
      try {
        var autoResults = JSON.parse(body).results.filter(function(obj) {
          return obj.kind == kind;
        })
        fulfill(Promise.all(autoResults.slice(0, 3).map(function(result) {
          return resolveURL(result.entity.permalink_url)
            .then(function(item) {
              return item;
            })
            .then(null, reject);
        })));
      } catch (e) {
        reject(e);
      }

    });
  }))
}

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

function regSearch(q, kind) {
  var sQuery = {
    q: q,
    client_id: scClientID,
    limit: 30
  };
  return (new Promise(function(fulfill, reject) {
    var regularSearch = 'https://api-v2.soundcloud.com/search?' + queryString.stringify(sQuery)
    request.get(regularSearch, function(err, response, regResults) {
      if (err) reject(err);
      try {
        var regResults = JSON.parse(regResults).collection.filter(function(obj) {
          return obj.kind == kind;
        })
        fulfill(regResults.slice(0, 20))
      } catch (e) {
        reject(e)
      }
    });
  }))

}