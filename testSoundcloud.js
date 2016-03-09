var SC = require('soundclouder');
var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init(client_id, client_secret, redirect_uri);
var id = 250753249;
var accessToken = "1-183955-164339022-d8322239ae0ce";
SC.delete('/e1/me/track_reposts/' + id, accessToken, function(err, data) {
  console.log(err);
  console.log(data);
  SC.put('/e1/me/track_reposts/' + id, accessToken, function(err, data) {
    console.log(err);
    console.log(data);
  });
});