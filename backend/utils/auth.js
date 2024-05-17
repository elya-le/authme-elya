const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { User } = require('../db/models');

const { secret, expiresIn } = jwtConfig;

// helper function
// sends a JWT Cookie
const setTokenCookie = (res, user) => {

    const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    const token = jwt.sign(
        { data: safeUser },
        secret,
        { expiresIn: parseInt(expiresIn) }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie('token', token, {
        maxAge: expiresIn * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'Lax' : 'Strict'
    });

    return token;
};

// middleware
const restoreUser = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        console.log('No token found');
        return next();
    }

    jwt.verify(token, secret, null, async (err, jwtPayload) => {
        if (err) {
            console.log('Error verifying token:', err);
            return next();
        }

        try {
            const { id } = jwtPayload.data;
            const user = await User.findByPk(id);
            if (user) {
                req.user = user;
            } else {
                console.log('No user found for token');
            }
        } catch (error) {
            console.error('Error finding user:', error);
            return next();
        }

        return next();
    });
};


// if there is no current user, return an error
const requireAuth = (req, res, next) => {
    if (req.user) {
        return next();
    }

    res.status(401).json({
        message: 'Authentication required'
    });
};

module.exports = { setTokenCookie, restoreUser, requireAuth };