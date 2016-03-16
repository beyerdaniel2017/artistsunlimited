'use strict';

module.exports = function (io) {
    io.on('connection', function () {
    		console.log('connected');
        // Now have access to socket, wowzers!
    });
};
