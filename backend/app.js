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
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// load environment variables
require('dotenv').config();
const { environment } = require('./config');
const isProduction = environment === 'production';

// check if JWT_SECRET is loaded
// console.log('JWT_SECRET:', process.env.JWT_SECRET); // temporary log to check the secret

// import routes
const routes = require('./routes');

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

if (!isProduction) {
    app.use(cors({
        origin: true,
        credentials: true,
    }));
}

app.use(express.json());

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

// set up PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false,
    },
});

app.use(session({
    store: new pgSession({
        pool: pool, // connection pool
        tableName: 'session' // use another table-name than the default "session"
    }),
    secret: 'secret-key', // this should be consistent with your other secret keys, if this is unrelated, ignore this line
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
        sameSite: isProduction ? 'None' : 'Lax',
    }
}));

// add the CSRF token restore route after setting CSRF middleware
app.use(csurf({
    cookie: {
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Strict',
        httpOnly: true
    }
}));

app.get('/api/csrf/restore', (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken);
    res.status(200).json({
        'XSRF-Token': csrfToken
    });
});

// add a log to show incoming cookies
app.use((req, res, next) => {
    console.log('Cookies: ', req.cookies); // log incoming cookies
    next();
});

// root URL route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// use the routes defined in your routes folder
app.use(routes);

app.use((req, res, next) => {
    next();
});

// Not Found middleware - catches and forwards to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// general error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: isProduction ? {} : err.stack
    });
});

module.exports = app;
