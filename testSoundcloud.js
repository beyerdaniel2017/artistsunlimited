var SC = require('node-soundcloud');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');

var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init({
  client_id: client_id,
  // secret: client_secret,
  // redirect_uri: redirect_uri
});

SCResolve

// (new Promise(function(fulfill, reject) {
//   SCResolve({
//     url: process.env.SCURL,
//     client_id: process.env.SOUNDCLOUD_CLIENT_ID
//   }, function(err, track) {
//     if (err) {
//       reject(err);
//     } else {
//       fulfill(track);
//     }
//   });
// }))
// .then(function(track) {
//     track.trackURL = process.env.SCURL;
//     console.log(track);
//   })
//   .then(null, function(err) {
//     console.log(err);
//   })