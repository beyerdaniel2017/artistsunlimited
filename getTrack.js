var SC = require('node-soundcloud');
var CLIENT_ID = '1e57616d882f00c402ff95abd1f67b39';
var CLIENT_SECRET = '0934d66f53f5dcd06a1ce9f32e9a6267';
SC.init({
  id: CLIENT_ID,
  secret: CLIENT_SECRET,
  uri: 'facebook.com'
});

SC.get('/users/4780642/tracks', function(err, res) {
  if (err) {
    console.log("ERROR");
    console.log(err);
  } else {
    console.log(res)
  }
});