// load necessary modules
const express = require('express');
const router = express.Router();
const apiRouter = require('./api');

// router.get('/hello/world', function(req, res) {
//     res.cookie('XSRF-TOKEN', req.csrfToken());
//     res.send('Hello World!');
// });

// setup route to restore CSRF tokens
router.get("/api/csrf/restore", (req, res) => {
    const csrfToken = req.csrfToken(); // generate CSRF token
    res.cookie("XSRF-TOKEN", csrfToken); // set CSRF token in a cookie
    res.status(200).json({ 'XSRF-Token': csrfToken }); // respond with token
});

router.use('/api', apiRouter); // mount api router to handle all API requests

module.exports = router; // export the configured router