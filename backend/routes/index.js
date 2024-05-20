const express = require("express");
const router = express.Router();
const path = require('path');
const apiRouter = require("./api");
const testRouter = require('./api/test'); // import the test routes

// CSRF restore route
router.get('/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken(); 
    res.cookie("XSRF-TOKEN", csrfToken);  
    res.status(200).json({ 'XSRF-Token': csrfToken }); 
});

// base API routes
router.use('/api', apiRouter);

// use Test routes
router.use('/api/test', testRouter); // debugger test routes

// Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
    router.get('/api/csrf/restore', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.json({});
    });
}

// Static routes
// Serve React build files in production
if (process.env.NODE_ENV === 'production') {
    // Serve the frontend's index.html file at the root route
    router.get('/', (req, res) => { 
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.sendFile(
            path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
        );
    });

    // Serve the static assets in the frontend's build folder
    router.use(express.static(path.resolve(__dirname, '../../frontend', 'dist')));

    // Serve the frontend's index.html file at all other routes NOT starting with /api
    router.get(/^(?!\/?api).*/, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        return res.sendFile(
            path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
        );
    });
}

module.exports = router;
