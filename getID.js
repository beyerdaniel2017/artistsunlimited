var SC = require('node-soundcloud');
var HTTP = require('http');
var CLIENT_ID = '1e57616d882f00c402ff95abd1f67b39';
var CLIENT_SECRET = '0934d66f53f5dcd06a1ce9f32e9a6267';
process.stdin.resume();

var getPath = '/resolve.json?url=' + process.argv[2] + '&client_id=' + CLIENT_ID;
console.log(getPath);
HTTP.request({
  host: 'api.soundcloud.com',
  path: getPath,
}, function(res) {
  res.on("data", function(chunk) {
    var chunkString = "" + chunk;
    console.log(chunkString);
    var userID = chunkString.slice(chunkString.indexOf('cloud.com/') + 10, chunkString.indexOf('.json?'));
    console.log(userID);
  });
}).on('error', function(e) {
  console.log('problem with request: ' + e.message);
  rl.close();
}).end();