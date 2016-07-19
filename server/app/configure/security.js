var jwt = require('jsonwebtoken');
require('rootpath')();
var session = require('express-session');
var env = require('../../env');
var lusca = require('lusca');
module.exports = function(app) {
  app.disable('x-powered-by');
  app.use(lusca.csrf({
    angular: true
  }))
  app.use(lusca.csp({
    policy: {
      'default-src': '\'self\'',
      'script-src': '\'self\' https://*.soundcloud.com https://*.twitter.com https://*.facebook.net \'unsafe-eval\' \'unsafe-inline\'',
      'img-src': '* data:',
      'style-src': '* \'unsafe-inline\'',
      'connect-src': '\'self\' https://soundcloud.com https://*.soundcloud.com wss://localhost:1443 wss://artistsunlimited.co https://www.googleapis.com https://accounts.google.com',
      'frame-src': "https://*.soundcloud.com https://*.facebook.com",
      'media-src': '\'self\' https://*.s3.amazonaws.com'
    },
    reportOnly: false,
  }))
  app.use(lusca({
    xframe: '*',
    p3p: 'ABCDEF',
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xssProtection: true,
    nosniff: true
  }));
}