const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csrf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');

// load environment variables
require('dotenv').config();
const { environment } = require('./config');
const isProduction = environment === 'production';

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

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

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
    secret: process.env.SESSION_SECRET || 'secret-key', // use environment variable for security
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
app.use(csrf({
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

// Serve static files from the React frontend app in production
if (isProduction) {
    app.use(express.static(path.resolve(__dirname, '../frontend/dist')));

    // Serve the frontend's index.html file at the root route
    app.get('/', (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });

    // Serve the frontend's index.html file at all other routes NOT starting with /api
    app.get(/^(?!\/?api).*/, (req, res) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

// use the routes defined in your routes folder
app.use(routes);

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
