const express = require("express");
const router = express.Router();
const apiRouter = require("./api");
const testRouter = require('./api/test'); // import the test routes

// CSRF restore route
router.get('/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken(); 
    res.cookie("XSRF-TOKEN", csrfToken);  
    res.status(200).json({ 'XSRF-Token': csrfToken }); 
});
    
// ase API routes
router.use('/api', apiRouter);

// use Test routes
router.use('/api/test', testRouter); // add the test routes

if (process.env.NODE_ENV !== 'production') {
    router.get('/api/csrf/restore', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.json({});
    });
}

if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    
    router.get('/', (req, res) => { 
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.sendFile(
            path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
        );
    });

    router.use(express.static(path.resolve("../frontend/build")));

    router.get(/^(?!\/?api).*/, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.sendFile(
            path.resolve(__dirname, '../../frontend', 'build', 'index.html')
        );
    });
}

module.exports = router;
