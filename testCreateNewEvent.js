var SC = require('soundclouder');
var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";
SC.init(client_id, client_secret, redirect_uri);

SC.get('/users/198031384', function(err, data) {
  console.log(data);
  console.log(err);
});
setTimeout(function() {}, 30000);