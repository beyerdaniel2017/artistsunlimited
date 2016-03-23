var SC = require('node-soundcloud');
SCResolve = require('soundcloud-resolve-jsonp/node');

var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init({
  id: process.env.SOUNDCLOUD_CLIENT_ID,
  secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
  uri: process.env.SOUNDCLOUD_CALLBACK_URL
});
SCResolve({
  url: process.env.SCURL,
  client_id: process.env.SOUNDCLOUD_CLIENT_ID
}, function(err, track) {
  if (err) {
    console.log(err);
  } else {
    track.trackURL = process.env.SCURL;
    console.log(track);
  }
});