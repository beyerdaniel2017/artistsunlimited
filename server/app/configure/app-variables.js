'use strict';
var path = require('path');
var chalk = require('chalk');
var util = require('util');
require('./log.js');

var rootPath = path.join(__dirname, '../../../');
var indexPath = path.join(rootPath, './server/app/views/index.html');
var loginPath = path.join(rootPath, './server/app/views/login.html');
var faviconPath = path.join(rootPath, './server/app/views/favicon.ico');

var env = require(path.join(rootPath, './server/env'));

var logMiddleware = function(req, res, next) {
    util.log(('---NEW REQUEST---'));
    console.log(util.format(chalk.red('%s: %s %s'), 'REQUEST ', req.method, req.path));
    console.log(util.format(chalk.yellow('%s: %s'), 'QUERY   ', util.inspect(req.query)));
    console.log(util.format(chalk.cyan('%s: %s'), 'BODY    ', util.inspect(req.body)));
    global.log('------------------------------------------------')
    global.log('REQUEST ' + JSON.stringify(req.path));
    global.log('QUERY   ' + JSON.stringify(req.query));
    global.log('BODY    ' + JSON.stringify(req.query));
    next();
};

module.exports = function(app) {
    global.env = env;
    app.setValue('env', env);
    app.setValue('projectRoot', rootPath);
    app.setValue('indexHTMLPath', indexPath);
    app.setValue('loginHTMLPath', loginPath);
    app.setValue('faviconPath', faviconPath);
    app.setValue('log', logMiddleware);
};