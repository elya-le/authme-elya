console.log("Starting the application...");

// import packages
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const { environment } = require('./config');
const isProduction = environment === 'production'; // determine which environment we're in

// import routes
const routes = require('./routes');

const app = express(); // initialize express app

/* --- global middleware --- */

app.use(morgan('dev')); // log information about each request
app.use(cookieParser()); // parse cookies from the headers of our requests
app.use(express.json()); // parse json bodies

// security middleware setups
if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}

app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);

// session middleware configuration
app.use(session({
    secret: 'secret-key', // a secret key for signing the session ID cookie (use a secure, unique string)
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create a session until something is stored
    cookie: {
        secure: isProduction, // use secure cookies in production (requires HTTPS)
        maxAge: 1000 * 60 * 60 * 24 // expire cookie in 24 hours
    }
}));

// CSRF protection setup
app.use(
    csurf({
        cookie: {
            secure: isProduction,
            sameSite: isProduction && "Lax",
            httpOnly: true
        }
    })
);

// connect all the routes
app.use(routes); // placed after all middleware to ensure they are configured first

module.exports = app;
