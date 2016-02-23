var SC = require('soundclouder');
var client_id = "bd30924b4a322ba9e488c06edc73f909";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";

SC.init(client_id, client_secret, redirect_uri);
SC.put('/e1/me/track_reposts/55544874', "1-179263-198031384-2e0d86d066c6a", function(err, data) {
  console.log(err);
  console.log(data);
});