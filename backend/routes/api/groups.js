const express = require('express');
const router = express.Router();
const { Group, User, GroupImage, Venue, Event, Attendance } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize } = require('../../db/models');


router.use(restoreUser); // use restoreUser globally (or apply only to specific routes)

const authenticated = [restoreUser, requireAuth]; // middleware to require authentication


// helper function to handle validation errors
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

        // respond with the group data formatted as specified
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
router.put('/:groupId', authenticated, validateGroup, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;

    try {
        const group = await Group.findByPk(groupId); // find the group by ID first to check if it exists

        if (!group) { // if the group doesn't exist, return a 404 error
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

        res.status(200).json(updatedGroup); // respond with the updated group data
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

// validation middleware for venue data
const validateVenue = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
];

// POST /api/groups/:groupId/venues - Creates a new venue for a group
router.post('/:groupId/venues', authenticated, validateVenue, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;  // extract groupId from the URL parameters
    const { address, city, state, lat, lng } = req.body;  // extract venue details from the request body

    try {
        const group = await Group.findByPk(groupId);  // find the group by its id
        
        if (!group) {  // check if the group exists
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (group.organizerId !== req.user.id) {  // check if the current user is the organizer of the group
            return res.status(403).json({ message: "Forbidden. You need to be the organizer to add venues." });
        }

        const venue = await Venue.create({  // create the new venue
            groupId,
            address,
            city,
            state,
            lat,
            lng
        });

        res.status(200).json(venue);  // send the created venue as the response
    } catch (error) {
        console.error('Error creating venue for group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/groups/:groupId/venues - Returns all venues for a group
router.get('/:groupId/venues', authenticated, async (req, res) => {
    const { groupId } = req.params; // extract groupId from URL parameters

    try {
        const group = await Group.findByPk(groupId, {
            include: [
                {
                    model: User,
                    as: 'Organizer',
                    attributes: ['id']
                }
            ]
        });

        // check if the group exists
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        // get all venues for the group
        const venues = await Venue.findAll({
            where: { groupId: groupId }
        });

        res.status(200).json({ Venues: venues }); // send the venues as the response
    } catch (error) {
        console.error('Error fetching venues for group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/groups/:groupId/events - Returns all events for a specified group
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const events = await Event.findAll({
            where: { groupId: groupId },
            include: [
            {
                model: Venue,
                as: 'Venue',
                attributes: ['id', 'city', 'state']
            },
            {
                model: Attendance,
                as: 'Attendances',
                attributes: ['userID', 'status' ]
            }
        ],
        attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'startDate', 'endDate', 'previewImage', [sequelize.fn('COUNT', sequelize.col('Attendances.id')), 'numAttending']]
    });
    
    res.status(200).json({ Events: events });
} catch (error) {
    console.error('Failed to fetch events for the group:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
