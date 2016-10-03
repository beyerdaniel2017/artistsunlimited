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

			trade.findById(msg.tradeID)

			.then(function(tradeData) {
				if (tradeData) {
					tradeData.messages.push(message);
					if (tradeData.p1.user.toString() == msg.id.toString() && tradeData.p2.online == false) {
						tradeData.p2.alert = 'change';
					} else if (tradeData.p2.user.toString() == msg.id.toString() && tradeData.p1.online == false) {
						tradeData.p1.alert = 'change';
					}
					tradeData.save(function(result) {
						io.emit('send:message', {
							senderId: msg.id,
							date: new Date(),
							text: msg.message,
							type: msg.type,
							tradeID: msg.tradeID
						});
					})
				}
			});
		});

		socket.on('get:message', function(tradeID) {
			trade.findById(tradeID).populate('p1.user').populate('p2.user')
				.then(function(data) {
					io.emit('get:message', data);
				})
				.then(null, console.log);
		});
		socket.on('disconnect', function() {
			console.log('user disconnected');
		});
	});
};