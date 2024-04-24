// test router
const express = require('express');
const router = express.Router();

// test endpont for csrf token
router.get('/hello/world', function(req, res) {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    // sent to response body
    res.send('Hello World!');
});

module.exports = router;