const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, sequelize } = require('../../db/models'); 

// apply middleware to parse JSON bodies
router.use(express.json());

// POST endpoint for user registration with input validations
router.post('/',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('username').not().isEmpty().withMessage('Username is required'),
        body('firstName').not().isEmpty().withMessage('First Name is required'),
        body('lastName').not().isEmpty().withMessage('Last Name is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    async (req, res) => {
        // handle validation results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //return if validation errors
            return res.status(400).json({
                message: "Bad Request",
                errors: errors.array().reduce((acc, error) => ({
                    ...acc,
                    [error.param]: error.msg
                }), {})
            });
        }

        try { // details from request body
            const { firstName, lastName, email, username, password } = req.body;

            const emailExists = await User.findOne({ where: { email } });
            if (emailExists) {
                return res.status(500).json({
                    message: "User already exists",
                    errors: { email: "User with that email already exists" }
                });
            }

            const usernameExists = await User.findOne({
                where: {
                    // case-insensitive username check
                    username: sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('username')), 
                        sequelize.fn('LOWER', username)
                    )
                }
            });
            if (usernameExists) {
                return res.status(500).json({
                    message: "User already exists",
                    errors: { username: "User with that username already exists" }
                });
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            // create new user
            const user = await User.create({
                firstName,
                lastName,
                email,
                username,
                hashedPassword
            });

            // respond with newly create details
            res.status(200).json({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username
                }
            });

        } catch (error) {
            // error handling differentiate validation errors
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors.map(e => ({ [e.path]: e.message }))
                });
            } else {
                // log the error for debugging
                console.error(error);
                return res.status(500).json({
                    message: "An unexpected error occurred",
                    errors: { general: "An unexpected error occurred, please try again" }
                });
            }
        }
    }
);

module.exports = router;