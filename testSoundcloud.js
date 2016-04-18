var SC = require('node-soundcloud');
var SCR = require('soundclouder');
var SCResolve = require('soundcloud-resolve-jsonp/node');
var Promise = require('bluebird');
var HTTPS = require('https');

var client_id = "8002f0f8326d869668523d8e45a53b90";
var client_secret = "7c896a35685064e133b6a01998f62714";
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

var aT = "1-230936-203984864-45b23b349cb44";
var id = 241853814;

// SC.init({
//   client_id: client_id,
//   client_secret: client_secret,
//   oauth_token: aT,
//   redirect_uri: redirect_uri
// });

SCR.init(client_id, client_id, redirect_uri);
// fs.readFile('./hello.m4a', function(err, file) {
//   if (err) console.log(err);
//   if (file) {
//     console.log(file);
SCR.post('/tracks', aT, {
    track: {
      asset_data: fs.createReadStream("./hello.m4a"),
      title: 'hellomaybe'
    }
  },
  function(err, data) {
    if (err) {
      console.log('err');
      console.log(err);
    } else {
      console.log(data);
    }
  });
// }
// })

// SCR.get('/e1/me/track_reposts/' + id, aT, function(err, data) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(data);
// });