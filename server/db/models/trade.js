'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
 	messages: []    
});
mongoose.model('Trade', schema);