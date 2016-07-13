var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var request = require('request');
var accessToken = 'EAACF74AST74BAAZCA3IkYFhZA7pJNXekDn8sg35WBqOnMRE22jGkx6rGLFA9XHk1nueISUPb7fnFPaU2Iefi8nv5FrCZAfSCG8wXzTZAua2PFFmlzZCVB2J1LZAHgZAfaWiXUlVgdLhgUBMZB5omx6lPe65rjLmrERnm6uWYncp86QZDZD';

router.get('/', function(req, res, next) {
  if (req.query['hub.verify_token'] === 'let_me_manage') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Error, wrong validation token');
  }
})

router.post('/', function(req, res) {
  var data = req.body;
  if (data.object == 'page') {
    data.entry.forEach(function(pageEntry) {
      if (pageEntry.messaging) {
        pageEntry.messaging.forEach(function(messagingEvent) {
          if (messagingEvent.optin) {
            // receivedAuthentication(messagingEvent);
          } else if (messagingEvent.message) {
            receivedMessage(messagingEvent);
          } else if (messagingEvent.delivery) {
            // receivedDeliveryConfirmation(messagingEvent);
          } else if (messagingEvent.postback) {
            receivedPostback(messagingEvent);
          } else if (messagingEvent.read) {

          } else {
            console.log("Webhook received unknown messagingEvent: ", messagingEvent);
          }
        })
      }
    })
  }
  res.sendStatus(200);
});

function receivedMessage(message) {
  console.log('=======');
  console.log(JSON.stringify(message));
  request.post({
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
      form: {
        recipient: {
          id: message.sender.id
        },
        sender_action: 'typing_on'
      }
    },
    function(err, res, body) {
      console.log(body);
    });
  var form;
  if (message.quick_reply) {
    switch (message.quick_reply) {
      case 'red res':
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Solid_blue.svg/2000px-Solid_blue.svg.png'
              }
            }
          }
        }
        break;
      case 'blue res':
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: 'http://www.color-hex.com/palettes/1051.png'
              }
            }
          }
        }
    }
  } else {
    var rand = Math.floor(Math.random() * 9);
    switch (rand) {
      case 0:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            "text": "Heyo!"
          }
        }
        break;
      case 1:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'video',
              payload: {
                url: 'https://s-media-cache-ak0.pinimg.com/originals/c9/51/00/c95100f53c407fb2d29210e64fffba80.gif'
              }
            }
          }
        }
        break;
      case 2:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'file',
              payload: {
                url: 'http://www.dogstardaily.com/files/DogsChildren.pdf'
              }
            }
          }
        }
        break;
      case 3:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: 'Welcome to mink!',
                  image_url: 'https://s-media-cache-ak0.pinimg.com/564x/e5/bc/5c/e5bc5c5c9056d2520d82b946b1b745c1.jpg',
                  subtitle: "Buy luxury goods in a fast and exiting way!",
                  buttons: [{
                    type: 'web_url',
                    url: 'https://mink.chat',
                    title: 'View Website'
                  }, {
                    type: 'postback',
                    title: 'start chatting',
                    payload: 'start the chat'
                  }]
                }]
              }
            }
          }
        }
        break;
      case 4:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [{
                  title: 'Welcome to mink!',
                  image_url: 'https://s-media-cache-ak0.pinimg.com/564x/e5/bc/5c/e5bc5c5c9056d2520d82b946b1b745c1.jpg',
                  subtitle: "Buy luxury goods in a fast and exiting way!",
                  buttons: [{
                    type: 'web_url',
                    url: 'https://mink.chat',
                    title: 'View Website'
                  }, {
                    type: 'postback',
                    title: 'start chat',
                    payload: 'start the chat'
                  }]
                }, {
                  title: 'Welcome to mink!',
                  image_url: 'https://s-media-cache-ak0.pinimg.com/564x/e5/bc/5c/e5bc5c5c9056d2520d82b946b1b745c1.jpg',
                  subtitle: "Buy luxury goods in a fast and exiting way!",
                  buttons: [{
                    type: 'web_url',
                    url: 'https://mink.chat',
                    title: 'See website'
                  }, {
                    type: 'postback',
                    title: 'Chat me up!',
                    payload: 'start the chat'
                  }]
                }, {
                  title: 'Welcome to mink!',
                  image_url: 'https://s-media-cache-ak0.pinimg.com/564x/e5/bc/5c/e5bc5c5c9056d2520d82b946b1b745c1.jpg',
                  subtitle: "Buy luxury goods in a fast and exiting way!",
                  buttons: [{
                    type: 'web_url',
                    url: 'https://mink.chat',
                    title: 'Go to Website'
                  }, {
                    type: 'postback',
                    title: 'I want to chat!',
                    payload: 'start the chat'
                  }]
                }]
              }
            }
          }
        }
        break;
      case 5:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: 'What should we do?',
                buttons: [{
                  type: 'web_url',
                  url: 'https://www.google.com/search?q=funny+dog+photos&espv=2&biw=1366&bih=629&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiUwvXdnN3NAhUE8j4KHZhRA2UQ_AUIBigB&dpr=1#imgrc=BjVzKa66Jpj8PM%3A',
                  title: 'see funny dog photo'
                }, {
                  type: 'postback',
                  title: 'Yay?',
                  payload: 'say yay'
                }]
              }
            }
          }
        }
        break;
      case 6:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: "template",
              payload: {
                template_type: "receipt",
                recipient_name: "Christian Ayscue",
                order_number: "12345678902",
                currency: "USD",
                payment_method: "Stripe",
                order_url: "https://mink.chat",
                timestamp: "1428444852",
                elements: [{
                  title: "Women's jacket.",
                  subtitle: "100% Soft and Luxurious Cotton",
                  quantity: 1,
                  price: 25,
                  currency: "USD",
                  image_url: "http://studio488.co.uk/home/images/lifestyle-photography-02.jpg"
                }],
                "address": {
                  street_1: "531 Washington St.",
                  street_2: "",
                  city: "Santa Clara",
                  postal_code: "95050",
                  state: "CA",
                  country: "US"
                },
                summary: {
                  subtotal: 75.00,
                  shipping_cost: 4.95,
                  total_tax: 6.19,
                  total_cost: 56.14
                },
                adjustments: [{
                  name: "New Customer Discount",
                  amount: 20
                }, {
                  name: "$10 Off Coupon",
                  amount: 10
                }]
              }
            }
          }
        }
        break;
      case 7:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            text: 'Pick a color:',
            quick_replies: [{
              content_type: "text",
              title: 'red',
              payload: 'red res'
            }, {
              content_type: "text",
              title: 'blue',
              payload: 'blue res'
            }]
          }
        }
        break;
      case 8:
        form = {
          recipient: {
            id: message.sender.id
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: 'http://r.ddmcdn.com/s_f/o_1/cx_633/cy_0/cw_1725/ch_1725/w_720/APL/uploads/2014/11/too-cute-doggone-it-video-playlist.jpg'
              }
            }
          }
        }
        break;
    }
  }
  console.log('========= return ========');
  console.log(JSON.stringify(form));
  request.post({
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
      form: form
    },
    function(err, res, body) {
      if (err) {
        console.log(err)
      } else {
        console.log(body);
      }
    });
}

function receivedPostback(message) {
  console.log('=======');
  console.log(JSON.stringify(message));
  request.post({
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
      form: {
        recipient: {
          id: message.sender.id
        },
        sender_action: 'typing_on'
      }
    },
    function(err, res, body) {
      if (err) {
        console.log(err)
      } else {
        console.log(body);
      }
    });
  var form;
  if (message.postback.payload == 'start the chat') {
    form = {
      recipient: {
        id: message.sender.id
      },
      message: {
        text: "Thanks for starting the chat!"
      }
    }
  } else if (message.postback.payload == 'say yay') {
    form = {
      recipient: {
        id: message.sender.id
      },
      message: {
        text: "Yay!!!!"
      }
    }
  }
  request.post({
      url: "https://graph.facebook.com/v2.6/me/messages?access_token=" + accessToken,
      form: form
    },
    function(err, res, body) {
      console.log(body);
    });
}