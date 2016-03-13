var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  htmlMessage: {
    type: String
  },
  subject: {
    type: String
  },
  fromEmail: {
    type: String
  },
  fromName: {
    type: String
  },
  purpose: {
    type: String
  },
  reminderDay: {
    type: String
  }
})

mongoose.model("EmailTemplate", schema);