const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email.'),
    check('username')
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage('Please provide a username with at least 4 characters.'),
    check('username')
        .not()
        .isEmail()
        .withMessage('Username cannot be an email.'),
    check('password')
        .exists({ checkFalsy: true })
        .isLength({ min: 6 })
        .withMessage('Password must be 6 characters or more.'),
    check('firstName')  // validation for firstName
        .exists({ checkFalsy: true })
        .withMessage('First name is required.'),
    check('lastName')   // validation for lastName
        .exists({ checkFalsy: true })
        .withMessage('Last name is required.'),
    handleValidationErrors
];

// sign up
router.post(
    '/',
    validateSignup,
    async (req, res) => {
        const { email, password, username, firstName, lastName } = req.body;
        const hashedPassword = bcrypt.hashSync(password);

        // create a new user
        const user = await User.create({ 
            firstName,
            lastName,
            email, 
            username, 
            hashedPassword
        });
        
        const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,  
        lastName: user.lastName
        };

        await setTokenCookie(res, safeUser);

        return res.json({
        user: safeUser
        });
    }
);

module.exports = router;