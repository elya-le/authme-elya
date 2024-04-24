const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User } = require('../../db/models');  

// middleware to parse JSON bodies
router.use(express.json());

// POST /api/users sign up a user
router.post('/', async (req, res) => {
    const { firstName, lastName, email, username, password } = req.body;

    try {
        // check for existing user by email
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
            return res.status(500).json({
                message: "User already exists",
                errors: { email: "User with that email already exists" }
            });
        }

        // check for existing user by username
        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(500).json({
                message: "User already exists",
                errors: { username: "User with that username already exists" }
            });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            username,
            hashedPassword
        });

        // Assuming you handle sessions, set session info here (or generate a JWT)
        // req.session.userId = user.id; // Uncomment if using session-based authentication
        // or use JWT
        // const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '2h' });

        // Respond with the new user's information
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
        res.status(400).json({
            message: "Bad Request",
            errors: error.errors.map(e => e.message)
        });
    }
});

module.exports = router;
