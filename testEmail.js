'use strict';
const mandrill = require('mandrill-api/mandrill');

const mandrill_client = new mandrill.Mandrill('9afIjRP5BCsKXkqqDbPY1Q');

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html) {
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
            "email": to_email,
            "name": to_name
        }],
        "important": false,
        "track_opens": false,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": []
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({
        "message": message,
        "async": async,
        "ip_pool": ip_pool
    }, function(result) {
        //promisify 
        return result
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
}

sendEmail('Christian Ayscue', 'tryenc.com', 'Christian Ayscue', 'coayscue@gmail.com', 'Keep it 100', 'Dear Christian,<br><br>I hope you have a nice day. Keep it 100.<br><br>Best,<br>Christian');