var fs = require('fs');
var stream = fs.createWriteStream("./tmp/log.txt");

global.log = function(input) {
  stream.write(input + '\n');
}

module.exports = global.log;