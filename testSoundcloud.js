var SC = require('node-soundcloud');
var client_id = "8586b9dbb45ce4c062d23efac6ad2f27";
var client_secret = "f09ab9b33abcefcb2dacdc58fb2b5558";
var redirect_uri = "http://tracksubmission.herokuapp.com/callback.html";

SC.init({
  id: client_id,
  secret: client_secret,
  uri: redirect_uri,
  accessToken: "1-183955-86560544-ef29d3c0da9f78"
});
var id = 249651811;
var accessToken = "1-183955-86560544-ef29d3c0da9f78";
SC.delete('/e1/me/track_reposts/' + id, function(err, data) {
    SC.put('/e1/me/track_reposts/' + id, function(err, data) {
      if (err) {
        sendMessage("CHRISTIAN", "coayscue@gmail.com", "ERROR", "coayscue@gmail.com", "ERROR REPOSTING", "Error: " + JSON.stringify(err) + "\n   Event:" + JSON.stringify(event));
      } else {
        if (event.email) {
          sendMessage(event.name, event.email, "Edward Sanchez", "edward@peninsulamgmt.com", "Music Submission", "Hey " + event.name + ",<br><br>We would just like to let you know the track has been reposted on <a href='" + channel.url + "'>" + channel.displayName + "</a>! If you would like to do another round of reposts please resubmit your track to bit.ly/SoundCloudSubmission. We will get back to you ASAP and continue to do our best in making our submission process as quick and easy as possible.<br><br>How was this experience by the way? Feel free to email some feedback, suggestions or just positive reviews to feedback@peninsulamgmt.com.<br><br>Goodluck and thanks again!<br><br>Kevin Zimmermann and Edward Sanchez<br> Peninsula MGMT Team <br>www.facebook.com / kevinlatropical<br> www.facebook.com / edwardlatropical");
        }
        Event.findByIdAndRemove(event._id).exec();
      }
    });
  })
  // SC.get('/e1/me/track_reposts/246530869', "1-183955-198031384-ab51f5a4123c3", function(err, data) {
  //   console.log(err);
  //   console.log(data);
  // });

// var postArr = [{
//   "paid": true,
//   "trackID": 243318419,
//   "channelID": "64684860",
//   "email": "hiphopsharks@outlook.com",
//   "name": "Eli Kreger",
//   "__v": 0
// }, {
//   "paid": true,
//   "trackID": 248293875,
//   "channelID": "64684860",
//   "email": "kenwatersmusic@gmail.com",
//   "name": "Ken Waters",
//   "__v": 0
// }, {
//   "paid": true,
//   "trackID": 245896386,
//   "channelID": "64684860",
//   "email": "philippe.weitzel@gmail.com",
//   "name": "Philippe Weitzel",
//   "__v": 0
// }, {
//   "paid": true,
//   "trackID": 247085707,
//   "channelID": "203522426",
//   "email": "rinomusic@outlook.com",
//   "name": "Rino",
//   "__v": 0
// }, {
//   "paid": true,
//   "trackID": 247085707,
//   "channelID": "164339022",
//   "email": "rinomusic@outlook.com",
//   "name": "Rino",
//   "__v": 0
// }, {
//   "paid": true,
//   "trackID": 247085707,
//   "channelID": "64684860",
//   "email": "rinomusic@outlook.com",
//   "name": "Rino",
//   "__v": 0
// }]

// postArr.forEach(function(element) {
//   repost(element);
// });

// function repost(event) {
//   var accessToken;
//   if (event.channelID == "6468486") {
//     accessToken = "1-179263-64684860-b027663686f34b";
//   } else if (event.channelID == "164339022") {
//     accessToken = "1-179263-164339022-1936aaaa0141c";
//   } else {
//     accessToken = "1-179263-203522426-eff83ba564c96";
//   }

//   SC.init(client_id, client_secret, "http://tracksubmission.herokuapp.com/callback.html");
//   SC.put('/e1/me/track_reposts/' + event.trackID, accessToken, function(err, data) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log(event);
//     }
//   });
// }