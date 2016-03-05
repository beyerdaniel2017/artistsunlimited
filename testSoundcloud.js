var SC = require('soundclouder');
var client_id = "8586b9dbb45ce4c062d23efac6ad2f27";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";


SC.init(client_id, client_secret, redirect_uri);
// SC.get('/e1/me/track_reposts', "1-179263-164339022-b8ea6a2ab5742", function(err, data) {
//   console.log(err);
//   console.log(data);
// });

var postArr = [{
  "paid": true,
  "trackID": 243318419,
  "channelID": "64684860",
  "email": "hiphopsharks@outlook.com",
  "name": "Eli Kreger",
  "__v": 0
}, {
  "paid": true,
  "trackID": 248293875,
  "channelID": "64684860",
  "email": "kenwatersmusic@gmail.com",
  "name": "Ken Waters",
  "__v": 0
}, {
  "paid": true,
  "trackID": 245896386,
  "channelID": "64684860",
  "email": "philippe.weitzel@gmail.com",
  "name": "Philippe Weitzel",
  "__v": 0
}, {
  "paid": true,
  "trackID": 247085707,
  "channelID": "203522426",
  "email": "rinomusic@outlook.com",
  "name": "Rino",
  "__v": 0
}, {
  "paid": true,
  "trackID": 247085707,
  "channelID": "164339022",
  "email": "rinomusic@outlook.com",
  "name": "Rino",
  "__v": 0
}, {
  "paid": true,
  "trackID": 247085707,
  "channelID": "64684860",
  "email": "rinomusic@outlook.com",
  "name": "Rino",
  "__v": 0
}]

postArr.forEach(function(element) {
  repost(element);
});

function repost(event) {
  var accessToken;
  if (event.channelID == "6468486") {
    accessToken = "1-179263-64684860-b027663686f34b";
  } else if (event.channelID == "164339022") {
    accessToken = "1-179263-164339022-1936aaaa0141c";
  } else {
    accessToken = "1-179263-203522426-eff83ba564c96";
  }

  SC.init(client_id, client_secret, "http://tracksubmission.herokuapp.com/callback.html");
  SC.put('/e1/me/track_reposts/' + event.trackID, accessToken, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(event);
    }
  });
}