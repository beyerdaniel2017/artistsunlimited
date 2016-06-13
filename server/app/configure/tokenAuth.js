var jwt = require('jsonwebtoken');
require('rootpath')();
var _ = require('lodash');
module.exports = app;

function app() {
    return function(req, res, next) {
        var logintoken = req.body.logintoken || req.query.logintoken || req.params.logintoken || req.cookies.logintoken;
        if(typeof logintoken != 'undefined')
        {
           jwt.verify(logintoken, global.env.SESSION_SECRET || 'arTistisUnlimited', function(err, decoded) {           
                        if (err) {
                    return res.json({status: 401, message: 'Not authorized'})
                        }
               else{
                        req.decoded = decoded;
                        next();
                }               
                    });
                }
        else
        {
            return next();
        }
    }
};