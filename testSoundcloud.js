var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');

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

var aT = "1-231090-203984864-4391af1070f8c";
var id = 251831353;
SCR.init(client_id, client_secret, redirect_uri);
SCR.put('/e1/me/track_reposts/' + id, aT, function(err, data) {
  console.log(JSON.stringify(err));
  console.log(data);
});