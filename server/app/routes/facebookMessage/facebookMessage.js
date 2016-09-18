var router = require('express').Router();
module.exports = router;
var mongoose = require('mongoose');
var request = require('request');
var messengerAPI = require('../../messengerAPI/messengerAPI.js');
var moment = require('moment');
var User = mongoose.model('User');

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
    User.findById(message.optin.ref).exec()
        .then(function(user) {
            user.notificationSettings.facebookMessenger.messengerID = message.sender.id;
            user.save();
            console.log(user);
        }).then(null, console.log);
}

function sendSignup(user) {

}

function receivedMessage(message) {
    messengerAPI.buttons(message.sender.id, 'Hey, please go here:', [{
        type: "web_url",
        url: "https://artistsunlimited.com",
        title: "Artists Unlimited"
    }]).then(null, null);
}

function signupUser(messengerID) {

}

function receivedPostback(message) {

}

function processQuiz(truthy, quizID, questionNum, messengerID) {

}