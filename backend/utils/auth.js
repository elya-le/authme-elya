const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// helper function
// sends a JWT Cookie
const setTokenCookie = (res, user) => {
    // create the token.
    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };
    const token = jwt.sign(
        { data: safeUser },
        secret,
      { expiresIn: parseInt(expiresIn) } // 604,800 seconds = 1 week
    );

    const isProduction = process.env.NODE_ENV === "production";

    // set the token cookie
    res.cookie('token', token, {
      maxAge: expiresIn * 1000, // maxAge in milliseconds
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction && "Lax"
    });

    return token;
};

// middleware
// if there is a User found in the search, then save the user to a key of user onto the Request (req.user)
// if there is an error verifying the JWT or a Usercannot be found with the id in the JWT payload, 
// then clear the token cookie from the response and set req.user to null.
const restoreUser = (req, res, next) => {
    // token parsed from cookies
    const { token } = req.cookies;
    req.user = null;
    // to verify that JWT hasnt been tampered with
    return jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
        return next(); // allow request to pass through if user is not logged in
        }
    
    // if token is present find users whos info attatched to that token
    try {
        const { id } = jwtPayload.data;
        req.user = await User.findByPk(id, {
            attributes: {
            include: ['email', 'createdAt', 'updatedAt'] // offerides part of scope that hides this info from user
            }
        });
        } catch (e) {
        res.clearCookie('token'); // if no user is found then token is removed
        return next();
        }

    if (!req.user) res.clearCookie('token');

    return next();
    });
};

// if there is no current user, return an error
const requireAuth = function (req, _res, next) {
    if (req.user) return next(); 

    const err = new Error('Authentication required');
    err.title = 'Authentication required';
    err.errors = { message: 'Authentication required' };
    err.status = 401;
    return next(err);
}

module.exports = { setTokenCookie, restoreUser, requireAuth };