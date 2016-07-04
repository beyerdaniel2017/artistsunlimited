var SC = require('node-soundcloud');
var CLIENT_ID = '1e57616d882f00c402ff95abd1f67b39';
var CLIENT_SECRET = '0934d66f53f5dcd06a1ce9f32e9a6267';

var scwrapper = require('./server/app/SCWrapper/SCWrapper.js');

scwrapper.init({
  id: CLIENT_ID,
  secret: CLIENT_SECRET,
  uri: 'facebook.com'
});

var reqObj = {
  method: 'GET',
  path: '/tracks/145408854',
}

scwrapper.request(reqObj, function(err, data) {
  console.log(err);
  console.log(data);
  // if (err) {
  //   console.log('err');
  //   console.log(err);
  // } else {
  //   console.log('data');
  //   console.log(data);
  // }
});