var fs = require('fs');
var http = require('http');
var Promise = require('promise');
var trackID = 272922789;
var totalSuccesses = 0;
var accessTokenArray = ['ff023a620394846dc2abb3cf6b48e4ea', '134e3bd683d8b4772be6b8c29074b029', '8c0fa73ad5c07f83cb21b257b958daad', '38faf7d0e959c949499860f6443afa66', '281e06c3436513c40ff4bc57b57c3d61'];
var ipArray = fs.readFileSync('./proxyList.txt').toString().replace(/(\r\n|\n|\r)/g, '\n').split('\n');
var ipIndex = 0;
for (var i = 0; i < 100; i++) {
  runPlayer();
}

function runPlayer() {
  if (ipArray[ipIndex]) {
    ipIndex = (ipIndex + 1) % (ipArray.length - 2);
    var ipAndPort = ipArray[ipIndex].split(':');
    requestPromise(ipAndPort)
      .then(function(res) {
        console.log(res);
        runPlayer();
      }, function(err) {
        // console.log(err);
        runPlayer();
      })
  }
}


var body = '';

function requestPromise(ipAndPort) {
  return new Promise(function(resolve, reject) {
    var req = http.request({
      host: ipAndPort[0],
      port: ipAndPort[1],
      method: 'GET',
      path: 'https://api.soundcloud.com/tracks/' + trackID + '/stream?client_id=' + accessTokenArray[Math.floor(Math.random() * 5)],
      headers: {
        connection: 'keep-alive'
      },
      agent: false
    }, function(res) {
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        // console.log(body);
        resolve('------ done -----')
        totalSuccesses++;
      })
    })
    req.setTimeout(30000, function() {
      reject('timed out')
    });
    req.on('error', function(err) {
      reject(err);
    });
    req.end();
  })
}

var minPassed = 0;

// function clock() {
//   setTimeout(function() {
//     console.log("-------------- " + (++minPassed) + " minutes ---------------");
//     console.log("Total successes: " + totalSuccesses);
//     clock();
//   }, 60000)
// }
// clock();

process.on('uncaughtException', function(err) {
  runPlayer();
});