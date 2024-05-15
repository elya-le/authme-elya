const express = require("express");
const router = express.Router();

const apiRouter = require("./api");
const venuesRouter = require('./api/venues');

// add XSRF-TOKEN cookie and return the CSRF token
router.get('/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken(); 
    res.cookie("XSRF-TOKEN", csrfToken);  
    res.status(200).json({ 'XSRF-Token': csrfToken }); 
});
    
router.use('/api', apiRouter);
router.use('/api/venues', venuesRouter);

module.exports = router;