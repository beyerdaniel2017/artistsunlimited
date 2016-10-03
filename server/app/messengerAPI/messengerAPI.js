var request = require('request');
var accessToken = 'EAAZALD0boJU8BAAAup11zYZBJwYRNJKF9o7rrPL84AwJeBjyKN5qXwieZBuRxrMSBrMVJOI0nzFZBo0Uc3BFvxYBaB9mqyACylGDaVSZCZAuiyXkbDa6mluGV8R2rbHgU3ZChfEah9ZCTJ3OcRhw5sfkcw8RRRMc0wfp6xBw9qNRSQZDZD';

module.exports = {
  typing: function(userID) {
    request.post({
        url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
        form: {
          recipient: {
            id: userID
          },
          sender_action: 'typing_on'
        }
      },
      function(err, res, body) {});
  },
  text: function(userID, text) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        "text": text
      }
    }
    return sendForm(form);
  },
  image: function(userID, imageURL) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: imageURL
          }
        }
      }
    }
    return sendForm(form);
  },
  quickReplies: function(userID, text, replies) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        text: text,
        quick_replies: replies
      }
    }
    return sendForm(form);
  },
  receipt: function(userID, receipt) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: "template",
          payload: receipt
        }
      }
    }
    return sendForm(form);
  },
  templates: function(userID, elements) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: elements
          }
        }
      }
    }
    return sendForm(form);
  },
  buttons: function(userID, text, buttons) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: text,
            buttons: buttons
          }
        }
      }
    }
    return sendForm(form);
  },
  file: function(userID, fileURL) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: 'file',
          payload: {
            url: fileURL
          }
        }
      }
    }
    return sendForm(form);
  },
  video: function(userID, videoURL) {
    var form = {
      recipient: {
        id: userID
      },
      message: {
        attachment: {
          type: 'video',
          payload: {
            url: videoURL
          }
        }
      }
    }
    return sendForm(form);
  }
}

function sendForm(form) {
  return new Promise(function(resolve, reject) {
    request.post({
        url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
        form: form
      },
      function(err, res, body) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(body);
        }
      });
  });
}