'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/channels', require('./channels/channels.js'));
router.use('/submissions', require('./submissions/submissions.js'));
router.use('/login', require('./login/login.js'));
router.use('/events', require('./events/events.js'));
router.use('/soundcloud', require('./soundC/soundC.js'));

// Make sure this is after all of
// the registered routes!
router.use(function(req, res) {
  res.status(404).end();
});