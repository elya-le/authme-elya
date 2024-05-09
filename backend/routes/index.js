const express = require("express");
const router = express.Router();

const apiRouter = require("./api");

// add a XSRF-TOKEN cookie and return the CSRF token
router.get('/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken();  // correctly define csrfToken
    res.cookie("XSRF-TOKEN", csrfToken);  // set the cookie
    res.status(200).json({ 'XSRF-Token': csrfToken });  // send the response
});
    
router.use('/api', apiRouter);

module.exports = router;