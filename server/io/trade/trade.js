	'use strict';
	var mongoose = require('mongoose');
var trade = mongoose.model('Trade');
	module.exports = function (io) {
	    io.on('connection', function (socket) {
	        // Now have access to socket, wowzers!
	   socket.on('send:message', function(msg){
	   	trade.update({_id: msg.tradeID},{$addToSet:{messages:{
	   		senderId:msg.id,
	   		date:new Date(),
          	text:msg.message,
      	type: msg.type
	   	}}, $set: {'p1.alert': msg.trade.p1.alert, 'p2.alert': msg.trade.p2.alert}},{upsert:true},function(error,data){
	   		io.emit('send:message', {
	   		senderId:msg.id,
	   		date:new Date(),
    			text:msg.message,
    			type: msg.type,
          tradeID: msg.tradeID
	   	});
	   	});
  });

 		socket.on('get:message', function(tradeID){
	   	trade.find({_id:tradeID},function(err,data){
	   	io.emit('get:message', data);
	   });
  });
	    });
	};
