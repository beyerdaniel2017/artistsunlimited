var fs = require('fs');
var http = require('http');
var Promise = require('promise');
var trackID = 268934108;
var totalSuccesses = 0;
var accessTokenArray = ['ee257a3ee081df347a7da0e7eaadda8f', '014c4c8bf547f1cf2a7be20fb804289d', 'a73d4b654c1f6580b89ddb356b75b59c', '00ad464dbfde6f98703f954bea83dd3a', 'eece149338265f3e2b9d164ddfc2ffa9'];
var ipArray = fs.readFileSync('./proxyList.txt').toString().replace(/(\r\n|\n|\r)/g, '\n').split('\n');
var ipIndex = 0;
for (var i = 0; i < 100; i++) {
  runPlayer();
}

function runPlayer() {
  if (ipArray[ipIndex]) {
    ipIndex++;
    var ipAndPort = ipArray[ipIndex].split(':');
    requestPromise(ipAndPort)
      .then(function(res) {
        console.log(res);
        runPlayer();
      }, function(err) {
        runPlayer();
      })
  }
}


function requestPromise(ipAndPort) {
  return new Promise(function(resolve, reject) {
    var req = http.request({
      host: ipAndPort[0],
      port: ipAndPort[1],
      method: 'GET',
      path: 'http://api.soundcloud.com/tracks/' + trackID + '/stream?client_id=' + accessTokenArray[Math.floor(Math.random() * 5)],
      headers: {
        connection: 'keep-alive'
      },
      agent: false
    }, function(res) {
      res.on('data', function() {});
      res.on('end', function() {
        totalSuccesses++;
        resolve('--------done--------');
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

function clock() {
  setTimeout(function() {
    console.log("-------------- " + (++minPassed) + " minutes ---------------");
    console.log("Total successes: " + totalSuccesses);
    clock();
  }, 60000)
}
clock();

process.on('uncaughtException', function(err) {});