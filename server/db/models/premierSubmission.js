'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    s3URL: {
        type: String
    },
    genre: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    comment: { 
        type: String
    },
    status: {
        type: String, 
        default: 'new'
    }
});

mongoose.model('PremierSubmission', schema);