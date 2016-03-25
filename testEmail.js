'use strict';
const mandrill = require('mandrill-api/mandrill');
const Promise = require('bluebird')
const m = new mandrill.Mandrill('9afIjRP5BCsKXkqqDbPY1Q');

let message = {
    "html": 'Dear Christian,<br><br>I hope you have a nice day. Keep it 100.<br><br>Best,<br>Christian',
    "subject": 'Promise Test 3',
    "from_email": 'coayscue@gmail.com',
    "from_name": 'Christian',
    "to": [{
        "email": 'tryenc@gmail.com',
        "name": 'Chris'
    }]
};

function sendEmail(opts) {
    return new Promise(function (resolve, reject) {
        m.messages.send(opts, resolve, reject)
    })
}

sendEmail({'message': message})
.then(function(res){
    console.log("res", res);
})
.catch(function(err){
    console.error("err", err);
});