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

app.use(morgan('dev')); // log HTTP requests
app.use(cookieParser()); // parse cookies
app.use(express.json()); // parse JSON request bodies

if (!isProduction) {
  app.use(cors({
    origin: true, // allow all origins
    credentials: true, // allow credentials
  }));
} else {
  app.use(cors({
    origin: ['https://meetpup-elya.onrender.com'], // replace with frontend URL
    credentials: true, // allow credentials
  }));
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow cross-origin requests
  contentSecurityPolicy: false, // disable CSP
}));

// serve static files from the "public/images" directory
app.use('/images', express.static(path.join(__dirname, 'public/images'))); 

// set up PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true, // require SSL
    rejectUnauthorized: false, // don't reject unauthorized SSL certificates
  },
});

app.use(session({
  store: new pgSession({
    pool: pool, // connection pool
    tableName: 'session' // use another table-name than the default "session"
  }),
  secret: process.env.SESSION_SECRET || 'secret-key', // use environment variable for security
  resave: false, // don't resave session if unmodified
  saveUninitialized: false, // don't create session until something stored
  cookie: {
    secure: isProduction, // use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true, // don't allow client-side JavaScript to access the cookie
    sameSite: isProduction ? 'None' : 'Lax', // set to 'None' for cross-site requests
  }
}));

// add csrf token middleware before other middleware
app.use(csrf({
  cookie: {
    secure: isProduction, // use secure cookies in production
    sameSite: isProduction ? 'None' : 'Strict', // set to 'None' for cross-site requests
    httpOnly: true // don't allow client-side JavaScript to access the cookie
  }
}));

// restore csrf token
app.get('/api/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie('XSRF-TOKEN', csrfToken, {
    secure: isProduction, // use secure cookies in production
    sameSite: isProduction ? 'None' : 'Strict', // set to 'None' for cross-site requests
    httpOnly: false // allow client-side JavaScript to access the cookie
  });
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
