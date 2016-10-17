var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');
var HTTPS = require('https');
var scWrapper = require('./server/app/SCWrapper/SCWrapper.js');
var request = require('request');

var client_id = "e72f5b4e3b48dc9015fe168cc6d66fa8";
var client_secret = "ee5f5be9ff2d8ec040098ade0b42e1f2";
var redirect_uri = "https://artistsunlimited.co/callback.html";
var fs = require('fs');

// SC.init({
//   client_id: client_id,
//   // secret: client_secret,
//   // redirect_uri: redirect_uri
// });

// HTTPS.request({
//     hostname: 'api.soundcloud.com',
//     path: '/e1/me/track_reposts/'+id,
//     method: 'PUT'
//   }, function(res) {
//     var dataChunk = '';
//     res.on('data', function(data) {
//       dataChunk += data;
//     });
//     res.on('end', function() {
//       console.log(dataChunk);
//     })
//   })
//   .on('error', function(err) {
//     throw err;
//   })
//   .end();

var aT = "1-231090-148393-11845152e60d2d6d";
var id = 286840750;
// SCR.init(client_id, client_secret, redirect_uri);
// SC.init(client_id, client_id, redirect_uri);
// SCR.get('/users/' + id, function(err, data) {
//   if (err) {
//     console.log('err');
//     console.log(err);
//   }
//   console.log(data);
// });
scWrapper.init({
  id: client_id,
  secret: client_secret,
  uri: redirect_uri
});
scWrapper.setToken(aT);
var reqObj = {
  method: 'PUT',
  path: '/e1/me/track_reposts/' + id,
  qs: {
    oauth_token: aT
  }
};
scWrapper.request(reqObj, function(err, data) {
  console.log('err -------' + JSON.stringify(err));
  console.log('data ------' + JSON.stringify(data));
});

// var total = ""

// function get(url) {
//   request.get(url, function(err, res, body) {
//     if (err) {
//       console.log(err);
//     } else {
//       var body = JSON.parse(body);
//       if (body.next_href) {
//         body.collection.forEach(function(follower) {
//           total += follower.id + ","
//         })
//         get(body.next_href);
//       } else {
//         console.log(total);
//       }
//     }
//   })
// }

// get("http://api.soundcloud.com/users/86560544/followings?client_id=8002f0f8326d869668523d8e45a53b90&page_size=200")