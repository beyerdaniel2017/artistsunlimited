var Promise = require('promise');
var SCResolve = require('soundcloud-resolve-jsonp/node')
var SC = require('node-soundcloud');

(new Promise(function(fulfill, reject) {
  SCResolve({
    url: process.env[2],
    client_id: "8002f0f8326d869668523d8e45a53b90"
  }, function(err, track) {
    if (err) {
      reject(err);
    } else {
      fulfill(track);
    }
  });
}))
.then(function(user) {
    console.log(user);
    getUsers('/users/' + user.id + '/followers');
  })
  .then(null, console.log);


function getUsers(nextURL) {
  console.log('-');
  SC.get(nextURL, {
        limit: 200
      }, function(err, res) {
        if (err) console.log(err);
        if (res && res.next_href) getUsers(res.next_href);
        if (res && res.collection) {
          var collectionLength = res.collection.length
          res.collection.forEach(function(follower) {
              getUser('/users/' + follower.id + '/followers');
              if (follower.description) {
                var myArray = follower.description.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
              } else {
                var myArray = null;
              }
              if (myArray) {
                var email = myArray[0];
                //for every email in my array:
                Follower.findOne({
                    "email": email
                  }).exec()
                  .then(function(flwr) {
                    if (!flwr) {
                      var artist = (flwr.tracks > 0);
                      var newFollower = new Follower({
                        email: String,
                        numTracks: Number,
                        artist: Boolean,
                        soundcloudID: Number,
                        soundcloudURL: String,
                        username: String,
                        followers: Number,
                        randomDay: Number //randomDay between 1 and 50
                      });
                      newFollower.save();
                    }
                  });
              }
            }
          }
        }
      }