module.exports = {
    environment: process.env.NODE_ENV || 'development', // sets the enviroment type default
    port: process.env.PORT || 8000, // sets server port
    dbFile: process.env.DB_FILE, // path to SQlite database file
    jwtConfig: {
        secret: process.env.JWT_SECRET, // secret key for JWT signing
        expiresIn: process.env.JWT_EXPIRES_IN // token expiration time
    },
};

