var mandrill = require('mandrill-api/mandrill');
var Promise = require('bluebird');
var m = new mandrill.Mandrill('9afIjRP5BCsKXkqqDbPY1Q');

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html) {

    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
            "email": to_email,
            "name": to_name
        }]
    };
    console.log(message);

    function sender() {
        return new Promise(function(resolve, reject) {
            m.messages.send({
                'message': message
            }, resolve, reject)
        })
    }

    sender()
        .then(function(res) {
            return res;
        })
        .catch(function(err) {
            console.error('A mandrill error occurred: ' + err.name + ' - ' + err.message);
        });

}

module.exports = sendEmail;