var SC = require('node-soundcloud');
var CLIENT_ID = 'e72f5b4e3b48dc9015fe168cc6d66fa8';
var CLIENT_SECRET = 'ee5f5be9ff2d8ec040098ade0b42e1f2';

var scwrapper = require('./server/app/SCWrapper/SCWrapper.js');

SC.init({
  id: CLIENT_ID,
  secret: CLIENT_SECRET,
  uri: 'facebook.com',
  // accessToken: '1-231090-203984864-3136740eee2e4'
});

// var reqObj = {
//   method: 'GET',
//   path: '/tracks/145408854',
// }

// scwrapper.request(reqObj, function(err, data) {
//   console.log(err);
//   console.log(data);
//   // if (err) {
//   //   console.log('err');
//   //   console.log(err);
//   // } else {
//   //   console.log('data');
//   //   console.log(data);
//   // }
// });

scwrapper.setToken('1-231090-159813180-2a168e61a9907');
scwrapper.request({
    method: 'PUT',
    path: '/me/followings/229290629'
  },
  function(err, response) {
    if (err) console.log('error following main artist: ' + JSON.stringify(err));
    else console.log(response);
  });
// scwrapper.setToken('1-230936-212407694-ee3eae5fe92b1');
// scwrapper.request({
//   method: 'PUT',
//   path: '/me/followings/225727688',
//   qs: {}
// }, function(err, response) {
//   if (err) console.log('error following main artist: ' + JSON.stringify(err));
//   else console.log(response);
// });

// SC.put('/me/followings/208940792', function(err, data) {
//   console.log('err');
//   console.log(err);
//   console.log('data');
//   console.log(data);
// })