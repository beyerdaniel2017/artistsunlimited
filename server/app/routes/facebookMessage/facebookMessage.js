module.exports = router;
var mongoose = require('mongoose');
var request = require('request');
var accessToken = 'EAACF74AST74BAAZCA3IkYFhZA7pJNXekDn8sg35WBqOnMRE22jGkx6rGLFA9XHk1nueISUPb7fnFPaU2Iefi8nv5FrCZAfSCG8wXzTZAua2PFFmlzZCVB2J1LZAHgZAfaWiXUlVgdLhgUBMZB5omx6lPe65rjLmrERnm6uWYncp86QZDZD';
var messengerAPI = require('../../messengerAPI/messengerAPI.js');
var sendEmail = require('../../mandrill/sendEmail.js');
var helpers = require('../../helpers.js');
var moment = require('moment');

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
                    console.log(JSON.stringify(messagingEvent));
                    if (messagingEvent.optin) {
                        receivedAuthentication(messagingEvent);
                    } else if (messagingEvent.message) {
                        if (!messagingEvent.is_echo) receivedMessage(messagingEvent);
                    } else if (messagingEvent.delivery) {
                        // receivedDeliveryConfirmation(messagingEvent);
                    } else if (messagingEvent.postback) {
                        receivedPostback(messagingEvent);
                    } else if (messagingEvent.read) {
                        readMessage(messagingEvent)
                    } else {
                        console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                    }
                })
            }
        })
    }
    res.sendStatus(200);
});

function readMessage(messagingEvent) {

}

function receivedAuthentication(message) {

}

function sendSignup(user) {

}

function receivedMessage(message) {

}

function signupUser(messengerID) {

}

function receivedPostback(message) {

}

function processQuiz(truthy, quizID, questionNum, messengerID) {

}