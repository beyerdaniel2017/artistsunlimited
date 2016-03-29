var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');
var HTTPS = require('https');

var client_id = "e72f5b4e3b48dc9015fe168cc6d66fa8";
var client_secret = "ee5f5be9ff2d8ec040098ade0b42e1f2";
var redirect_uri = "https://artistsunlimited.co/callback.html";

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

var aT = "1-231090-164339022-ae77ca15080b5";
var id = 247518988;

// SC.initialize({
//   client_id: client_id,
//   oauth_token: aT,
//   redirect_uri: redirect_uri
// });

// SC.get('/tracks/' + id).then(function(data) {
//     console.log(data);
//   })
//   .then(null, console.log);

SCR.init(client_id, client_secret, redirect_uri);
SCR.get('/e1/me/track_reposts/' + id, aT, function(err, data) {
  if (err) {
    console.log(err);
  }
  console.log(data);
});