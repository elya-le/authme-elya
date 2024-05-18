const express = require('express');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../../db/models');
const { setTokenCookie, restoreUser } = require('../../utils/auth');

// GET /api/session - return the current user
router.get('/', restoreUser, (req, res) => {
    if (req.user) { // if user is authenticated
        return res.json({
            user: {
                id: req.user.id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                username: req.user.username
            }
        });
    } else { // if user is not authenticated
        return res.json({ user: null });
    }
});

// POST /api/session - logging in a user
router.post('/',
[
    body('credential').not().isEmpty().withMessage('Email or username is required'), // validate credential
    body('password').not().isEmpty().withMessage('Password is required') // validate password
],
async (req, res) => {
    try {
        console.log('POST /api/session request body:', req.body);
        const errors = validationResult(req); // validate request
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({
                message: 'Bad Request',
                errors: errors.array().reduce((acc, error) => ({
                    ...acc,
                    [error.param]: error.msg
                }), {})
            });
        }

        const { credential, password } = req.body;
        console.log('Received login request with credential:', credential);
        const normalizedCredential = credential.toLowerCase(); // normalize credential to lowercase
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), normalizedCredential),
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), normalizedCredential)
                ]
            },
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'hashedPassword']
        });

        if (user) { // if user is found
            console.log('User found:', user);
            const hashedPassword = user.hashedPassword.toString(); // convert hashedPassword from Buffer to string
            if (bcrypt.compareSync(password, hashedPassword)) { // compare provided password with stored hashed password
                console.log('Password match for user:', user);
                setTokenCookie(res, user); // set the token cookie for the user

                return res.json({
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        username: user.username
                    }
                });
            } else {
                console.log('Password mismatch for user:', user);
            }
        } else {
            console.log('User not found for credential:', credential);
        }

        return res.status(401).json({
            message: 'Invalid credentials' // if credentials are invalid
        });
    } catch (error) {
        console.error('Error in POST /api/session:', error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;
