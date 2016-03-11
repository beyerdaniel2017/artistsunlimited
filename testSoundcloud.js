var SC = require('node-soundcloud');
var client_id = "3947f8d665f6c6c58e865f894798eb3e";
var client_secret = "8586b9dbb45ce4c062d23efac6ad2f27";
var redirect_uri = "http://localhost:1337/callback.html";

SC.init({
  id: client_id,
  secret: client_secret,
  uri: redirect_uri
});
var accessToken = "1-183955-164339022-d8322239ae0ce";
var id = 86560544;
SC.get('/users/' + id + '/web-profiles', function(err, webProfiles) {
  console.log(err);
  var follower = {};
  if (webProfiles) {
    for (var index in webProfiles) {
      console.log(index);
      switch (webProfiles[index].service) {
        case 'twitter':
          follower.twitterURL = webProfiles[index].url;
          break;
        case 'instagram':
          follower.instagramURL = webProfiles[index].url;
          break;
        case 'facebook':
          follower.facebookURL = webProfiles[index].url;
          break;
        case 'youtube':
          follower.youtubeURL = webProfiles[index].url;
          break;
        case 'personal':
          follower.websites += webProfiles[index].url + '\n';
      }
    }
  }
  console.log(follower);
});