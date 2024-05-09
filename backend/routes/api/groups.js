const express = require('express');
const router = express.Router();
const { Group, User, GroupImage, Venue} = require('../../db/models');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { restoreUser } = require('../../utils/auth');

// Middleware to require authentication
const requireAuth = [restoreUser, (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ message: "Authentication required" });
    }
}];
router.use(restoreUser);
router.use(requireAuth);


// GET /api/groups - Gets all groups
router.get('/', async (req, res, next) => {
    try {
        const groups = await Group.findAll({
            include: [{ model: User, as: 'Organizer' }]  // Use the correct alias as defined in your model association
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        next(error);
    }
});

// GET /api/groups/current - Gets all groups organized or joined by the current user
router.get('/current', requireAuth, async (req, res, next) => {
    try {
        const groups = await Group.findAll({
            where: {
                [Op.or]: [
                    { organizerId: req.user.id },
                    // Add here if there are other ways to determine group membership
                ]
            },
            include: [{ model: User, as: 'Organizer' }]  // Adjust the alias to match your model association
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        next(error);
    }
});

// Validation middleware to check the incoming data
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
        .exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters')
        .isUppercase().withMessage('State must be uppercase'),
];

// POST /api/groups - Create a new group
router.post('/', validateGroup, async (req, res, next) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: errors.mapped()
        });
    }

    try {
        // Create the new group with the current user as the organizer
        const group = await Group.create({
            organizerId: user.id,
            name,
            about,
            type,
            private,
            city,
            state,
        });

        // Send a success response
        return res.status(201).json(group);
    } catch (error) {
        next(error);
    }
});


// GET /api/groups/:groupId - Gets details of a group by its id
router.get('/:groupId', async (req, res, next) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findByPk(groupId, {
            include: [
                { model: User, as: 'Organizer', attributes: ['id', 'firstName', 'lastName'] },
                { model: GroupImage, as: 'GroupImages', attributes: ['id', 'url', 'preview'] },
                { model: Venue, as: 'Venues', attributes: ['id', 'address', 'city', 'state', 'lat', 'lng'] }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
});

// PUT /api/groups/:groupId - Updates a group
router.put('/:groupId', validateGroup, async (req, res, next) => {
    const { groupId } = req.params;
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;

    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: errors.mapped()
        });
    }

    try {
        // Find the group with the provided ID
        const group = await Group.findByPk(groupId);

        // If the group doesn't exist, return a 404 error
        if (!group) {
            return res.status(404).json({
                message: "Group couldn't be found",
            });
        }

        // Check if the current user is the organizer of the group
        if (group.organizerId !== user.id) {
            // If not, return a 403 error for unauthorized access
            return res.status(403).json({
                message: "Forbidden. You are not authorized to edit this group.",
            });
        }

        // Update the group if the user is authorized
        const updatedGroup = await group.update({
            name,
            about,
            type,
            private,
            city,
            state,
        });

        // Send a success response
        res.json(updatedGroup);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/groups/:groupId - Deletes a group
router.delete('/:groupId', async (req, res, next) => {
    const { groupId } = req.params;
    const { user } = req;

    try {
        // find the group with the provided ID
        const group = await Group.findByPk(groupId);

        // if the group doesn't exist, return a 404 error
        if (!group) {
            return res.status(404).json({
                message: "Group couldn't be found",
            });
        }

        // check if the current user is the organizer of the group
        if (group.organizerId !== user.id) {
            // If not, return a 403 error for unauthorized access
            return res.status(403).json({
                message: "Forbidden. You are not authorized to delete this group.",
            });
        }

        // delete the group if the user is authorized
        await group.destroy();

        // send a success response
        res.json({
            message: "Successfully deleted",
        });
    } catch (error) {
        next(error);
    }
});





module.exports = router;
