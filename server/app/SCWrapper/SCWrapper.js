  'use strict';
  var https       = require('https');
  var qs          = require('querystring');
  var hostApi     = 'api.soundcloud.com';
  var hostConnect = 'https://soundcloud.com/connect';

  module.exports = (function() {
    function SCWrapper() {
      // Not yet authorized or initialized by default
      this.isAuthorized = false;
      this.isInit = false;
    }

    SCWrapper.prototype.init = function(options) {
      this.clientId = options.id;
      this.clientSecret = options.secret;
      this.redirectUri = options.uri;
      if ( options.accessToken ) {
        this.setToken(options.accessToken);
      }
      this.isInit = true;
    };
    // SCWrapper.prototype.getConfig = function() {
    //   return {
    //     client_id: this.clientId,
    //     client_secret: this.clientSecret,
    //     redirect_uri: this.redirectUri,
    //     response_type: 'code',
    //     scope: 'non-expiring'
    //   };
    // };
    SCWrapper.prototype.setToken = function(token) {
      this.accessToken = token;
      this.isAuthorized = true;
    };
    // SCWrapper.prototype.setUser = function(id) {
    //   this.userId = id;
    // };
    
    SCWrapper.prototype.request = function(data, callback) {
      var qsObj = data.qs;
      if(!data.qs){
        qsObj = {
          client_id : this.clientId,
          format : 'json'
        };
      }
      else{
        qsObj.client_id = this.clientId;
        qsObj.format = 'json';
      }
      var endpoint = data.path.split('/')[1];
      if (endpoint === 'me') {
        if ( this.isAuthorized ) {
          qsObj.oauth_token = this.accessToken;  
        } else {
          callback({
            message: 'Not authorized to use path: ' + data.path
          });          
          return false;
        }
      }
      var qsdata = (qsObj) ? qs.stringify(data.qs) : '';    
      var paramChar = data.path.indexOf('?') >= 0 ? '&' : '?';
      var options = {
        hostname: hostApi,
        path: data.path + paramChar + qsdata,
        method: data.method
      };
      var req;
      var body;

      if ( data.method === 'POST' ) {
        options.path = data.path;
        options.headers = {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Content-Length': qsdata.length
        };
      }

      req = https.request(options, function (response) {
        body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });
        response.on('end', function () {
          try {     
            var d = JSON.parse(body);
          //var d=body;
            if ( Number(response.statusCode) >= 400 ) {
              callback(d.errors, d);
            } else {
              callback(undefined, d);
            }
          } catch (e) {
            callback(e);
          }
        });
      });

      req.on('error', function (e) {
        callback(e);
      });

      if ( data.method === 'POST' ) {
        req.write(qsdata);
      }
      return req.end();
    }
    return new SCWrapper();
  })();
