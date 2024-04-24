// groups.js in backend/routes/api
const express = require('express');
const router = express.Router();
const { Group } = require('../../db/models'); // adjust this import according to your project structure

// GET /api/groups: Retrieve all groups
router.get('/', async (req, res) => {
    const groups = await Group.findAll();
    res.json(groups);
});

// POST /api/groups: Create a new group
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    const group = await Group.create({ name, description });
    res.json(group);
});

// PUT /api/groups/:id: Update a group
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const group = await Group.findByPk(id);
    if (group) {
        await group.update(req.body);
        res.json(group);
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

// DELETE /api/groups/:id: Delete a group
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const group = await Group.findByPk(id);
    if (group) {
        await group.destroy();
        res.json({ message: 'Group deleted' });
    } else {
        res.status(404).json({ message: 'Group not found' });
    }
});

module.exports = router;
