'use strict';
var chalk = require('chalk');
var socketio = require('socket.io');
// Requires in ./db/index.js -- which returns a promise that represents
// mongoose establishing a connection to a MongoDB database.
var startDb = require('./db');
var fs = require('fs');
var path = require('path');

var options = {
  key: fs.readFileSync(path.join(__dirname, './keys/domain.key')),
  cert: fs.readFileSync(path.join(__dirname, './keys/artistsunlimited.co.crt'))
};

// Create a node server instance! cOoL!
// var secureServer = require('https').createServer(options);
var server = require('http').createServer();

var createApplication = function() {
  var app = require('./app');
  server.on('request', app);
  // secureServer.on('request', app); // Attach the Express application.
  var io = socketio(secureServer);
  require('./io')(io); // Attach socket.io.
  require('./io/notifications')(io);
};

var startServer = function() {

  var HTTP_PORT = process.env.HTTP_PORT || 1337;
  // var HTTPS_PORT = process.env.HTTPS_PORT || 1443;
  server.listen(HTTP_PORT, function() {
    console.log(chalk.blue('Server started on port', chalk.magenta(HTTP_PORT)));
  });
  // secureServer.listen(HTTPS_PORT, function() {
  //   console.log(chalk.blue('Secure server started on port', chalk.magenta(HTTPS_PORT)));
  // });
};

startDb().then(createApplication).then(startServer).catch(function(err) {
  console.error(chalk.red(err.stack));
  process.kill(1);
});