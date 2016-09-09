'use strict';
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  background:{},
  logo:{
    images:String,
    style:{
      align:String
    }
  },
  heading: {
    text: String,
    style: {
      fontSize: Number,
      fontColor: String,
      fontWeight: String
    }
  },
  subHeading: {
    text: String,
    style: {
      fontSize: Number,
      fontColor: String,
      fontWeight:String
    }
  },
  inputFields: {
    style:{
      border: Number,
      borderRadius: Number,
      placeHolder: String,
      borderColor: String,
    }
  },
  button: {
    text: String,
    style: {
      fontSize: Number,
      fontColor: String,
      border: Number,
      borderRadius: Number,
      bgColor: String
    }   
  },
  backgroundImage: {
    type: String
  }
});
mongoose.model('CustomSubmission', schema);