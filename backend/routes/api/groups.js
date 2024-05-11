const express = require('express');
const router = express.Router();
const { Group, User, GroupImage, Venue } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');

// use restoreUser globally (or apply only to specific routes)
router.use(restoreUser);

// middleware to require authentication
const authenticated = [restoreUser, requireAuth];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: errors.mapped()
        });
    }
    next();
};

// GET /api/groups - Gets all groups
router.get('/', async (req, res, next) => {
    try {
        const groups = await Group.findAll({
            include: [{ 
                model: User, 
                as: 'Organizer', 
                attributes: ['id', 'firstName', 'lastName'] 
            }]
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/groups/current - Gets all groups organized or joined by the current user
router.get('/current', authenticated, async (req, res, next) => {
    try {
        const groups = await Group.findAll({
            where: { organizerId: req.user.id },
            include: [{ 
                model: User, 
                as: 'Organizer', 
                attributes: ['id', 'firstName', 'lastName'] 
            }]
        });
        res.status(200).json({ Groups: groups });
    } catch (error) {
        console.error('Error fetching current user groups:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// validation middleware to check the incoming data for group creation
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

    // handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: errors.mapped()
        });
    }

    try {
        // create the new group with the current user as the organizer
        const group = await Group.create({
            organizerId: user.id,
            name,
            about,
            type,
            private,
            city,
            state,
        });

        // send a success response
        return res.status(201).json(group);
    } catch (error) {
        next(error);
    }
});


// GET /api/groups/:groupId - Gets details of a group by its id
router.get('/:groupId', async (req, res) => {
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

        // Respond with the group data formatted as specified
        res.status(200).json({
            id: group.id,
            organizerId: group.organizerId,
            name: group.name,
            about: group.about,
            type: group.type,
            private: group.private,
            city: group.city,
            state: group.state,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            numMembers: group.numMembers,
            GroupImages: group.GroupImages,
            Organizer: {
                id: group.Organizer.id,
                firstName: group.Organizer.firstName,
                lastName: group.Organizer.lastName
            },
            Venues: group.Venues
        });
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/groups/:groupId - Updates a group
router.put('/:groupId', authenticated, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { name, about, type, private: isPrivate, city, state } = req.body;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (group.organizerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden. You are not authorized to edit this group." });
        }

        const updatedGroup = await group.update({
            name,
            about,
            type,
            private: isPrivate,
            city,
            state,
        });

        res.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/groups/:groupId - Updates a group
router.put('/:groupId', authenticated, validateGroup, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;

    try {
        const group = await Group.findByPk(groupId);  // find the group by id
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" }); 
        }

        if (group.organizerId !== req.user.id) { // check if the current user is the organizer of the group
            return res.status(403).json({ message: "Forbidden. You are not authorized to edit this group." });  
        }

        const updatedGroup = await group.update({ // update the group with the new data
            name,
            about,
            type,
            private,
            city,
            state,
        });

        res.status(200).json(updatedGroup); // send the updated group data as the response
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// DELETE /api/groups/:groupId - Deletes a group
router.delete('/:groupId', async (req, res, next) => {
    const { groupId } = req.params;
    const { user } = req;

    try {
        const group = await Group.findByPk(groupId);   // find the group with the provided ID

        if (!group) { 
            return res.status(404).json({
                message: "Group couldn't be found",
            });
        }

        if (group.organizerId !== user.id) { // check if the current user is the organizer of the group
            return res.status(403).json({
                message: "Forbidden. You are not authorized to delete this group.",
            });
        }

        await group.destroy(); // delete the group if the user is authorized

        res.json({ // send a success response
            message: "Successfully deleted",
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/groups/:groupId/images - Adds an image to a group
router.post('/:groupId/images', authenticated, async (req, res) => {
    const { groupId } = req.params;
    const { url, preview } = req.body;

    try {
        const group = await Group.findByPk(groupId); // find the group by its id

        if (!group) { // check if the group exists
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (group.organizerId !== req.user.id) { // check if the current user is the organizer of the group
            return res.status(403).json({ message: "Forbidden. You are not authorized to add an image to this group." });
        }

        const groupImage = await GroupImage.create({  // create a new group image
            groupId,
            url,
            preview
        });

        res.json(groupImage);  // send the created group image as the response
    } catch (error) {
        console.error('Error adding image to group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
