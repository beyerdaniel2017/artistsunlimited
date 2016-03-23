var fs = require('fs');
var stream = fs.createWriteStream("./logs.txt");

global.log = function(input) {
  stream.write(input + '\n');
}

module.exports = global.log;