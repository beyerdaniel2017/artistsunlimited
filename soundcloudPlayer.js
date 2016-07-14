var fs = require('fs');
var http = require('http');
var Promise = require('promise');
var trackID = 272922789;
var totalSuccesses = 0;
var accessTokenArray = ['ff023a620394846dc2abb3cf6b48e4ea', '134e3bd683d8b4772be6b8c29074b029', '8c0fa73ad5c07f83cb21b257b958daad', '38faf7d0e959c949499860f6443afa66', '281e06c3436513c40ff4bc57b57c3d61', '2a09e9a6824d1e3d2a47a621d506228c', '35b9e9a39309f0826891e014e2bbd1eb', 'dfea0737275304bc5cfa2afa261e5314', '73f248979d28333f1c35b88ba66eefd5', '5844ba4405f47cd6f612ca61cbe0af61', 'b7603ae525e2ed951bd061ad7d7e975b', '4563b0f375b4725196ac6c445e72356f', '3f0e61f44d80a2b81f47ffccebdbdd51', '9a8436077c1191a933534b45b8c99081', '4966765694b42b2269d05c21ada46805', '4103215ce8f4abb5c8f7e76f49801853'];
var ipArray = fs.readFileSync('./proxyList.txt').toString().replace(/(\r\n|\n|\r)/g, '\n').split('\n');
var ipIndex = Math.floor(Math.random() * ipArray.length);
for (var i = 0; i < 100; i++) {
  runPlayer();
}

function runPlayer() {
  ipIndex = (ipIndex + 1) % (ipArray.length - 2);
  if (ipArray[ipIndex]) {
    var ipAndPort = ipArray[ipIndex].split(':');
    requestPromise(ipAndPort)
      .then(function(res) {
        // console.log(res);
        runPlayer();
      }, function(err) {
        // console.log(err);
        runPlayer();
      })
  } else {
    runPlayer();
  }
}

function requestPromise(ipAndPort) {
  return new Promise(function(resolve, reject) {
    var body = '';
    var req = http.request({
      host: ipAndPort[0],
      port: ipAndPort[1],
      method: 'GET',
      path: 'http://api.soundcloud.com/tracks/' + trackID + '/stream?client_id=' + accessTokenArray[Math.floor(Math.random() * 16)],
      headers: {
        connection: 'keep-alive'
      },
      agent: false
    }, function(res) {
      res.on('data', function(data) {
        body += data;
      });
      res.on('end', function() {
        try {
          var jsonBody = JSON.parse(body);
          if (jsonBody.status == '302 - Found') {
            totalSuccesses++;
          }
        } catch (e) {}
        resolve('done');
      })
    })
    req.setTimeout(20000, function() {
      reject('timed out')
    });
    req.on('error', function(err) {
      reject(err);
    });
    req.end();
  })
}

var minPassed = 0;

function clock() {
  setTimeout(function() {
    console.log("-------------- " + (++minPassed) + " minutes ---------------");
    console.log("Total successes: " + totalSuccesses);
    clock();
  }, 60000)
}
clock();

process.on('uncaughtException', function(err) {
  // console.log('-----critical error-----');
  // console.log(err);
  runPlayer();
});