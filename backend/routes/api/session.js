// session.js in backend/routes/api
const express = require('express');
const router = express.Router();
const { User } = require('../../db/models'); // adjust this import according to your project structure
const bcrypt = require('bcryptjs');

// POST /api/session: Log in a user
router.post('/', async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user && bcrypt.compareSync(password, user.hashedPassword)) {
        // Assuming you have a session handling setup here
        req.session.userId = user.id;
        return res.json({ id: user.id, email: user.email });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// DELETE /api/session: Log out a user
router.delete('/', (req, res) => {
    // Assuming session destruction logic here
    req.session.destroy(() => {
        res.json({ message: 'Successfully logged out' });
    });
});

module.exports = router;

