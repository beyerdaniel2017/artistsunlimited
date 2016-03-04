var SC = require('soundclouder');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";

SC.init(client_id, client_secret, redirect_uri);
SC.get('/e1/me/track_reposts', "1-179263-164339022-b8ea6a2ab5742", function(err, data) {
  console.log(err);
  console.log(data);
});