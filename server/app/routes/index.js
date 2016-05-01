'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/login', require('./auth/login.js'));
router.use('/signup', require('./auth/signup.js'));
router.use('/channels', require('./channels/channels.js'));
router.use('/submissions', require('./submissions/submissions.js'));
router.use('/events', require('./events/events.js'));
router.use('/soundcloud', require('./soundC/soundC.js'));
router.use('/database', require('./database/database.js'));
router.use('/download', require('./downloadTrack/downloadTrack.js'));
router.use('/premier', require('./premier/premier.js'));
router.use('/home', require('./home/home.js'));
router.use('/users', require('./user/user.js'));

router.use('/logout', function(req, res) {
  req.logout();
  return res.status(200).json({
    "success": "true",
    "message": "Logout Successful"
  });
});
// Make sure this is after all of
// the registered routes!
router.use(function(req, res) {
  res.status(404).end();
});