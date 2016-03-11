var SC = require('soundclouder');
var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init(client_id, client_secret, redirect_uri);
var accessToken = "1-183955-164339022-d8322239ae0ce";
var id = 86560544;
console.log('hello');
SC.get('/users/' + id + '/web-profiles', function(err, webProfs) {
  console.log('hello');
  console.log(err);
  console.log(webProfs);
  var follower = {};
  if (webProfs) {
    var twitter = webProfs.findOne(function(element) {
      return element.service == 'twitter'
    });
    if (twitter) follower.twitterURL = twitter.url;
    var instagram = webProfs.findOne(function(element) {
      return element.service == 'instagram'
    });
    if (instagram) follower.instagramURL = instagram.url;
    var facebook = webProfs.findOne(function(element) {
      return element.service == 'facebook'
    });
    if (facebook) follower.facebookURL = facebook.url;
    var youtube = webProfs.findOne(function(element) {
      return element.service == 'youtube'
    });
    if (youtube) follower.youtubeURL = youtube.url;
  }
  console.log(follower);
});