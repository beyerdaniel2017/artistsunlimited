var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');
var HTTPS = require('https');

var client_id = "1e57616d882f00c402ff95abd1f67b39";
var client_secret = "0934d66f53f5dcd06a1ce9f32e9a6267";
var redirect_uri = "http://localhost:1337/callback.html";

// SC.init({
//   client_id: client_id,
//   // secret: client_secret,
//   // redirect_uri: redirect_uri
// });

// (new Promise(function(fulfill, reject) {
//   SCResolve({
//     url: "https://soundcloud.com/royalxx/j-eliaye-they-say",
//     client_id: client_id
//   }, function(err, track) {
//     if (err) {
//       reject(err);
//     } else {
//       fulfill(track);
//     }
//   });
// }))
// .then(function(track) {
//     console.log(track);
//   })
//   .then(null, function(err) {
//     console.log(err);
//   })

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

var aT = "1-183955-147045855-0b443e23cd3ba";
var id = 253638850;
SCR.init(client_id, client_secret, redirect_uri);
var log = require("dysf.utils").logger
log.setLogLevel(5);
SCR.put('/e1/me/track_reposts/' + id, aT, function(err, data) {
  if (err) {
    throw err;
  }
  console.log(data);
});