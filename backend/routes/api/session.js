const express = require('express');
const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../../db/models');
const { setTokenCookie, restoreUser } = require('../../utils/auth');


// GET /api/session - Return the current user
router.get('/', restoreUser, (req, res) => {
    if (req.user) {
        return res.json({
            user: {
                id: req.user.id,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                email: req.user.email,
                username: req.user.username
            }
        });
    } else {
        return res.json({ user: null });
    }
});


// POST route for logging in a user
router.post('/',
    [
        body('credential').not().isEmpty().withMessage('Email or username is required'),
        body('password').not().isEmpty().withMessage('Password is required')
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

        const { credential, password } = req.body;
        const normalizedCredential = credential.toLowerCase(); // normalize input to lower case
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), normalizedCredential),
                    Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), normalizedCredential)
                ]
            },
            attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'hashedPassword']
        });

        console.log("Password:", password);
        console.log("Hashed Password:", user ? user.hashedPassword : "No user found");

        if (user && bcrypt.compareSync(password, user.hashedPassword)) {
            setTokenCookie(res, user);  // ensure this is called

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
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }
    }
);

module.exports = router;


module.exports = router;

