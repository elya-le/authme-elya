const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { User } = require('../../db/models');


/* --- POST /api/user Sign Up a User --- */
router.post('/', async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    try {
        // check if user already exists
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(500).json({
                message: "User already exists",
                errors: { email: "User with that email already exists" }
            });
        }

        const usernameExists = await User.findOne({ where: { username } });
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

        // generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Respond with user data
        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
            }
        });
    } catch (err) {
        res.status(400).json({
            message: "Bad Request",
            errors: err.errors
        });
    }
});