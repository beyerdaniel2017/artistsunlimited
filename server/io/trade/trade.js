'use strict';
var mongoose = require('mongoose');
var trade = mongoose.model('Trade');
module.exports = function(io) {
	io.on('connection', function(socket) {
		socket.on('send:message', function(msg) {
   		var message = {
						senderId: msg.id,
						date: new Date(),
						text: msg.message,
						type: msg.type
					}
   		msg.trade.messages.push(message);
		trade.update({
			_id: msg.tradeID
			}, {
				$set: {
					messages: msg.trade.messages,
					'p1.alert': msg.trade.p1.alert,
					'p2.alert': msg.trade.p2.alert
				}
			}, {
				upsert: true
			}, function(error, data) {
				io.emit('send:message', {
					senderId: msg.id,
					date: new Date(),
					text: msg.message,
					type: msg.type,
					tradeID: msg.tradeID
				});
			});
		});

		socket.on('get:message', function(tradeID) {
			trade.find({
				_id: tradeID
			}, function(err, data) {
				io.emit('get:message', data);
			});

	   	socket.on('disconnect', function(){
		    console.log('user disconnected');
	  	});    
		});
	});
};