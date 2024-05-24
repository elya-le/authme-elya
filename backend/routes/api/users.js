const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User, sequelize } = require('../../db/models'); 
const { setTokenCookie } = require('../../utils/auth'); 

const router = express.Router();

router.use(express.json()); 

// POST - user registration with input validations
router.post('/',
    [
        body('email').isEmail().withMessage('Invalid email'),
        body('username').not().isEmpty().withMessage('Username is required'),
        body('firstName').not().isEmpty().withMessage('First Name is required'),
        body('lastName').not().isEmpty().withMessage('Last Name is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    async (req, res) => {
        const errors = validationResult(req);  
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: "Bad Request",
                errors: errors.array().reduce((acc, error) => ({
                    ...acc,
                    [error.param]: error.msg
                }), {})
            });
        }

        try { 
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

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                firstName,
                lastName,
                email,
                username,
                hashedPassword
            });

            setTokenCookie(res, user); 

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
            if (error.name === 'SequelizeValidationError') { 
                return res.status(400).json({
                    message: "Validation error",
                    errors: error.errors.map(e => ({ [e.path]: e.message }))
                });
            } else {
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