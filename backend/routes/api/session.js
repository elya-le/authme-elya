const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();
const bcrypt = require('bcryptjs'); // import bcryptjs to hash passwords
const { body, validationResult } = require('express-validator'); // for validation
const { User } = require('../../db/models');

// POST route for logging in a user
router.post('/',
    [
        body('credential').not().isEmpty().withMessage('Email or username is required'), // validate 'credential' is not empty
        body('password').not().isEmpty().withMessage('Password is required') // validate 'password' is not empty
    ],
    async (req, res) => {
        // handle validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // if there are validation errors, return 400 status with details
            return res.status(400).json({
                message: "Bad Request",
                errors: errors.array().reduce((acc, error) => ({
                    ...acc,
                    [error.param]: error.msg
                }), {})
            });
        }

        try {
            // extract credential and password from request body
            const { credential, password } = req.body;

            // find user by credential (email or username)
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: credential },
                        { username: credential }
                    ]
                },
                attributes: [
                    'id', 
                    'email', 
                    'username', 
                    'firstName', 
                    'lastName', 
                    'hashedPassword']  // ensure hashedPassword is included
            });

            // check user and password validity
            if (user && bcrypt.compareSync(password, user.hashedPassword)) {
                // if credentials are valid, respond with user details
                return res.status(200).json({
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        username: user.username
                    }
                });
            } else {
                // if credentials are invalid, return 401 status
                return res.status(401).json({
                    message: "Invalid credentials"
                });
            }
        } catch (error) {
            // log the error and return 500 status for server error
            console.error('Login error:', error);
            return res.status(500).json({
                message: "An unexpected error occurred"
            });
        }
    }
);

module.exports = router;

