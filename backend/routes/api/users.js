// users.js in backend/routes/api
const express = require('express');
const router = express.Router();
const { User } = require('../../db/models'); // adjust this import according to your project structure
const bcrypt = require('bcryptjs');

// GET /api/users: Retrieve all users
router.get('/', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// POST /api/users: Create a new user
router.post('/', async (req, res) => {
    const { email, password, username } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({ email, username, hashedPassword });
    res.json(user);
});

// PUT /api/users/:id: Update a user
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (user) {
        await user.update(req.body);
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// DELETE /api/users/:id: Delete a user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (user) {
        await user.destroy();
        res.json({ message: 'User deleted' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = router;
