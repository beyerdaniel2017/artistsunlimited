var SC = require('soundclouder');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://serene-sands-30935.herokuapp.com/callback.html";
SC.init(client_id, client_secret, redirect_uri);

SC.get('/users/198031384', function(err, data) {
  console.log(data);
  console.log(err);
});
setTimeout(function() {}, 30000);