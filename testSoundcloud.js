var SC = require('node-soundcloud');
var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init({
  id: client_id,
  secret: client_secret,
  uri: redirect_uri
});
SC.get('/tracks/' + process.argv[2], function(err, response) {
  console.log(response.permalink_url);
});