const express = require('express');
const router = express.Router();
const { Group, User, GroupImage, Venue, Event, Attendance, Membership } = require('../../db/models');
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
        
        res.status(200).json({ // respond with the group data formatted as specified
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
        
        if (!group) { // check if the group exists
            return res.status(404).json({ message: "Group couldn't be found" });
        }
        
        const venues = await Venue.findAll({ // get all venues for the group
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

// GET /api/groups/:groupId/members - Returns the members of a group
router.get('/:groupId/members', async (req, res) => {
    const { groupId } = req.params;
    let isOrganizerOrCoHost = false;  // flag to check if the current user is an organizer or a co-host

    try {
        const group = await Group.findByPk(groupId, {
            include: [{
                model: User,
                as: 'Organizer'
            }, {
                model: Membership,
                as: 'Memberships',
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['id', 'firstName', 'lastName']
                }]
            }]
        });
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }
        const currentUser = req.user ? req.user.id : null;  // restore user from the session if authentication is used
        if (currentUser) { // check if the current user is the organizer or a co-host
            isOrganizerOrCoHost = currentUser === group.organizerId || group.Memberships.some(m => m.userId === currentUser && m.status === 'co-host');
        }
        const members = group.Memberships.reduce((acc, membership) => { // if the current user is the organizer or a co-host, or the member is not pending, add to the list
            if (isOrganizerOrCoHost || membership.status !== 'pending') {
                acc.push({
                    id: membership.User.id,
                    firstName: membership.User.firstName,
                    lastName: membership.User.lastName,
                    Membership: {
                        status: membership.status
                    }
                });
            }
            return acc;
        }, []);
        return res.status(200).json({ Members: members });
    } catch (error) {
        console.error('Failed to fetch group members:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// Group validation
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

// Venue validation 
const validateVenue = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
];

// Event validation
const validateEvent = [
    check('name').exists({ checkFalsy: true }).withMessage('Name is required')
        .isLength({ min: 5 }).withMessage('Name must be at least 5 characters'),
    check('type').exists({ checkFalsy: true }).withMessage('Type is required')
        .isIn(['Online', 'In person', 'online', 'in person']).withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .isInt({ min: 2 }).withMessage('Capacity must be an integer and at least 2'),
    check('price')
        .isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    check('description')
        .exists({ checkFalsy: true }).withMessage('Description is required'),
    check('startDate')
        .isISO8601().withMessage('Start date must be a valid date')
        .custom((value, { req }) => new Date(value) > new Date()).withMessage('Start date must be in the future'),
    check('endDate')
        .isISO8601().withMessage('End date must be a valid date')
        .custom((value, { req }) => new Date(value) > new Date(req.body.startDate)).withMessage('End date must be after start date'),
    check('venueId')
        .isInt().withMessage('Venue ID must be an integer')
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

// POST /api/groups/:groupId/events - Create an event for a specific group
router.post('/:groupId/events', authenticated, async (req, res) => {
    console.log('Request body:', req.body);  // Log the whole request body
    const { groupId } = req.params;
    const { name, type, startDate, endDate, venueId, description, capacity, price } = req.body;

    try {
      const group = await Group.findByPk(groupId);  // check if the group exists
    if (!group) {
        return res.status(404).json({ message: "Group couldn't be found" });
    }
    const venue = await Venue.findByPk(venueId); // check if the venue exists
    if (!venueId) {
        return res.status(400).json({ message: "Venue ID is required" });
    }
    console.log(`Failed to find venue with ID: ${venueId}`);  // Log detailed error
    if (!venue) return res.status(404).json({ message: "Venue couldn't be found" });

    if (req.user.id !== group.organizerId) { // check if the current user is authorized to create the event
        return res.status(403).json({ message: "Forbidden: You are not allowed to create events for this group" });
    }
    const event = await Event.create({
        venueId,
        groupId,
        name,
        type,
        capacity,
        price,
        description,
        startDate,
        endDate
    });
    
    res.status(201).json(event);
} catch (error) {
    console.error('Failed to create event:', error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/groups/:groupId/membership - Request membership for a group
router.post('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;  // User ID from the authenticated session

    try {
        const group = await Group.findByPk(groupId, {  // check if the group exists and get the group with the organizer
            include: {
                model: User,
                as: 'Organizer'
            }
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (userId === group.organizerId) {  // check if the current user is the organizer of the group
            return res.status(400).json({ message: "User is already a member of the group" });
        }

        const existingMembership = await Membership.findOne({ // check if the user has already requested membership or is a member
            where: {
                groupId: groupId,
                userId: userId
            }
        });

        if (existingMembership) {
            if (existingMembership.status === 'pending') {
                return res.status(400).json({ message: "Membership has already been requested" });
            } else if (existingMembership.status === 'accepted') {
                return res.status(400).json({ message: "User is already a member of the group" });
            }
        }

        const membership = await Membership.create({ // create a pending membership
            userId: userId,
            groupId: groupId,
            status: 'pending'  // assuming 'pending' is the initial status
        });

        return res.status(200).json({
            memberId: membership.userId,
            status: membership.status
        });
    } catch (error) {
        console.error('Failed to request membership:', error);
        return res.status(500).json({ message: 'Internal server error' });
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

// PUT /api/groups/:groupId/membership - Change the status of a membership for a group
router.put('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const { memberId, status } = req.body; // memberId is the ID of the member whose status is to be changed
    const userId = req.user.id; // user ID from the authenticated session

    try {
        const group = await Group.findByPk(groupId, { // check if the group exists
            include: [
                {
                    model: User,
                    as: 'Organizer'
                },
                {
                    model: Membership,
                    as: 'Memberships',
                    include: [{
                        model: User,
                        as: 'User'
                    }]
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const membership = group.Memberships.find(m => m.userId === memberId); // find the membership that is going to be updated
        if (!membership) {
            return res.status(404).json({ message: "Membership between the user and the group does not exist" });
        }

        if (status === 'pending') { // prevent changing the membership status to "pending"
            return res.status(400).json({ 
                message: "Bad Request", 
                errors: { "status": "Cannot change a membership status to pending" }
            });
        }

        if (membership.status === 'pending' && status === 'member') { // authorization check for changing the status from "pending" to "member"
            if (!(userId === group.organizerId || group.Memberships.some(m => m.userId === userId && m.status === 'co-host'))) {
                return res.status(403).json({ message: "Forbidden: You are not allowed to change the membership status" });
            }
        }

        if (membership.status === 'member' && status === 'co-host') {  // authorization check for changing the status from "member" to "co-host"
            if (userId !== group.organizerId) {
                return res.status(403).json({ message: "Forbidden: Only the organizer can change a member to a co-host" });
            }
        }

        membership.status = status; // update the membership status
        await membership.save();

        return res.status(200).json({
            id: membership.id,
            groupId: group.id,
            memberId: membership.userId,
            status: membership.status
        });
    } catch (error) {
        console.error('Failed to change membership status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/groups/:groupId - Deletes a group
router.delete('/:groupId', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;

    const t = await sequelize.transaction(); // start a transaction

    try {
        const group = await Group.findByPk(groupId, { transaction: t });
        if (!group) {
            await t.rollback(); // rollback the transaction
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (req.user.id !== group.organizerId) {
            await t.rollback(); // rollback the transaction
            return res.status(403).json({ message: "Forbidden: You are not allowed to delete this group" });
        }

        await GroupImage.destroy({ where: { groupId }, transaction: t }); // delete related GroupImages
        await Event.destroy({ where: { groupId }, transaction: t });   // delete related Events
        await Venue.destroy({ where: { groupId }, transaction: t }); // delete related Venues
        await Membership.destroy({ where: { groupId }, transaction: t }); // delete related Memberships
        await group.destroy({ transaction: t }); // delete the group
        await t.commit(); // commit the transaction

        return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        await t.rollback(); // rollback the transaction on error
        console.error('Failed to delete group:', error);
        return res.status(500).json({ message: 'Internal server error', errors: error.errors ? error.errors.map(e => e.message) : [error.message] });
    }
});

// DELETE /api/groups/:groupId/membership/:memberId - Delete a membership to a group
router.delete('/:groupId/membership/:memberId', restoreUser, requireAuth, async (req, res) => {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;  // User ID from the authenticated session

    try {
        const group = await Group.findByPk(groupId); // check if the group exists
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }
    
        const user = await User.findByPk(memberId);  // check if the user (whose membership is to be deleted) exists
        if (!user) {
            return res.status(404).json({ message: "User couldn't be found" });
        }

        const membership = await Membership.findOne({ // check if the membership exists
            where: {
                groupId: groupId,
                userId: memberId
            }
        });

        if (!membership) {
            return res.status(404).json({ message: "Membership does not exist for this User" });
        }

        // Authorization check:
        if (userId !== group.organizerId && userId !== parseInt(memberId)) {  // current User must be the host of the group or the user whose membership is being deleted
            return res.status(403).json({ message: "Forbidden: You are not allowed to delete this membership" });
        }

        await membership.destroy(); // delete the membership

        return res.status(200).json({
            message: "Successfully deleted membership from group"
        });
    } catch (error) {
        console.error('Failed to delete membership:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
