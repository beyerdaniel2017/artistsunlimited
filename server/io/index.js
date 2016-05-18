'use strict';
var mongoose = require('mongoose');
var trade = mongoose.model('Trade');

module.exports = function(io) {
  io.on('connection', function(socket) {
    socket.on('send:message', function(msg) {
      trade.update({}, {
        $addToSet: {
          messages: {
            senderId: msg.id,
            date: new Date(),
            text: msg.message
          }
        }
      }, {
        upsert: true
      }, function(error, data) {
        io.emit('send:message', {
          senderId: msg.id,
          date: new Date(),
          text: msg.message
        });
      });
    });

    socket.on('get:message', function() {
      trade.find({}, function(err, data) {
        io.emit('get:message', data);
      });
    });
  });
};