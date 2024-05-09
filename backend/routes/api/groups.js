const express = require('express');
const router = express.Router();
const { Group } = require('../../db/models'); // adjust this import according to your project structure
const { check, validationResult } = require('express-validator'); //for validation
const { handleValidationErrors } = require('../../utils/validation'); // validation middleware

// GET /api/groups - Gets all groups
router.get('/', async (req, res, next) => {
    try {
        const groups = await Group.findAll({
        // optionally include other models like organizerId
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        next(error);
    }
});

// GET /api/groups/current - Gets all groups organized or joined by the current user
router.get('/current', async (req, res, next) => {
    try {
        const groups = await Group.findAll({
            where: {
                // Assuming you have a way to determine if a user is an organizer or a member
                [Op.or]: [
                    { organizerId: req.user.id },
                    { '$Members.userId$': req.user.id } // If you have a Members model linked
                ]
            },
            include: [{
                model: User, // This includes details about users in the response
                as: 'Members',
                required: false
            }]
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        next(error);
    }
});

// validation middleware to check the incoming data
const validateGroup = [
    check('name')
        .exists({ checkFalsy: true })
        .isLength({ max: 60 }).withMessage('Name must be 60 characters or less'),
    check('about')
        .isLength({ min: 50 }).withMessage('About must be 50 characters or more'),
    check('type')
        .isIn(['Online', 'In person']).withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .isBoolean().withMessage('Private must be a boolean'),
    check('city')
        .exists({ checkFalsy: true }).withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true }).withMessage('State is required'),
    handleValidationErrors
];


// POST /api/groups: Create a new group
router.post('/', validateGroup, async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    try {
        const group = await Group.create({ name, about, type, private, city, state });
        return res.status(201).json(group);
    } catch (error) {
        res.status(400).json({
            message: "Bad Request",
            errors: error.errors
        });
    }
});

// // PUT /api/groups/:id: Update a group
// router.put('/:id', async (req, res) => {
//     const { id } = req.params;
//     const group = await Group.findByPk(id);
//     if (group) {
//         await group.update(req.body);
//         res.json(group);
//     } else {
//         res.status(404).json({ message: 'Group not found' });
//     }
// });

// // DELETE /api/groups/:id: Delete a group
// router.delete('/:id', async (req, res) => {
//     const { id } = req.params;
//     const group = await Group.findByPk(id);
//     if (group) {
//         await group.destroy();
//         res.json({ message: 'Group deleted' });
//     } else {
//         res.status(404).json({ message: 'Group not found' });
//     }
// });

module.exports = router;
