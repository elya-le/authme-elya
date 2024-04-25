console.log("Starting the application...");

// import packages
const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const { environment } = require('./config');
const isProduction = environment === 'production'; // determine while enviroment were in

// import routes
const routes = require('./routes');

const app = express(); // initialize exprees app

/* --- global middleware --- */

app.use(morgan('dev')); // global middleware print info about each request
app.use(cookieParser()); // read cookies from mthe headers of our request
app.use(express.json()); // parse json bodies


// set up basic security middleware

if (!isProduction) {
    // enable cors only in development
    app.use(cors());
}
// helmet helps set a variety of headers for more security
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);

// set the _csrf token and create req.csrfToken method
// helps protect againsts csurf attacks
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
app.use(routes); 
// placed at bottom to make sure all requests 
// are passed through global middleware

const session = require('express-session');

// middleware that creates a session for each user when they log in
app.use(session({
    secret: 'secret-key',// a secret key for signing the session ID cookie (use a secure, unique string)
    resave: false, // dont save session if unmodified
    saveUninitialized: false, // dont create a session until something is stored
    cookie: {
        secure: process.env.NODE_ENV === "production",  // use secure cookies in production (requires HTTPS)
        maxAge: 1000 * 60 * 60 * 24  // expire cookie in 24 hours
    }
}));

/* --- place endpoints below this middleware --- */



module.exports = app;