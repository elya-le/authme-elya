const express = require('express');
const router = express.Router();
const { Group, User, GroupImage, Venue, Event, Attendance, Membership } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize } = require('../../db/models');

router.use(restoreUser);

const authenticated = [restoreUser, requireAuth];

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

// GET /api/groups - fetch group data
router.get('/', async (req, res) => {
    try {
        const groups = await Group.findAll({
            include: [
                { 
                    model: User, 
                    as: 'Organizer', 
                    attributes: ['id', 'firstName', 'lastName'] 
                },
                {
                    model: GroupImage,
                    as: 'GroupImages',
                    attributes: ['url'],
                    where: { preview: true },
                    required: false
                }
            ]
        });
        res.json({ Groups: groups });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Failed to fetch groups' }); 
    }
});

// GET /api/groups/current - gets all groups organized or joined by the current user
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

// GET /api/groups/:groupId - gets details of a group by its id
router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findByPk(groupId, {
            include: [
                { 
                    model: User, 
                    as: 'Organizer', 
                    attributes: ['id', 'firstName', 'lastName'] 
                },
                { 
                    model: GroupImage, 
                    as: 'GroupImages', 
                    attributes: ['id', 'url', 'preview'] 
                },
                { 
                    model: Venue, 
                    as: 'Venues', 
                    attributes: ['id', 'address', 'city', 'state', 'lat', 'lng'] 
                },
                { 
                    model: Event, 
                    as: 'Events', 
                    attributes: ['id', 'name', 'type', 'startDate', 'endDate', 'previewImage']
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

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
            Venues: group.Venues,
            Events: group.Events
        });
    } catch (error) {
        console.error('Error fetching group details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

// GET /api/groups/:groupId/events - returns all events for a group
router.get('/:groupId/events', async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findByPk(groupId, {
            include: [
                {
                    model: Event,
                    as: 'Events',
                    include: [
                        {
                            model: Venue,
                            as: 'Venue',
                            attributes: ['id', 'city', 'state']
                        },
                        {
                            model: Attendance,
                            as: 'Attendances',
                            attributes: ['id']
                        }
                    ]
                }
            ]
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const events = group.Events.map(event => ({
            id: event.id,
            groupId: event.groupId,
            venueId: event.venueId,
            name: event.name,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            numAttending: event.Attendances.length,
            previewImage: event.previewImage || null,
            Group: {
                id: group.id,
                name: group.name,
                city: group.city,
                state: group.state
            },
            Venue: event.Venue ? {
                id: event.Venue.id,
                city: event.Venue.city,
                state: event.Venue.state
            } : null
        }));

        res.status(200).json({ Events: events });
    } catch (error) {
        console.error('Error fetching events for group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/groups/:groupId/venues - returns all venues for a group
router.get('/:groupId/venues', authenticated, async (req, res) => {
    const { groupId } = req.params;

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

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const venues = await Venue.findAll({
            where: { groupId: groupId }
        });

        res.status(200).json({ Venues: venues });
    } catch (error) {
        console.error('Error fetching venues for group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/groups/:groupId/events - returns all events for a specified group
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
                    attributes: ['userID', 'status']
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

// GET /api/groups/:groupId/members - returns the members of a group
router.get('/:groupId/members', async (req, res) => {
    const { groupId } = req.params;
    let isOrganizerOrCoHost = false;

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
        const currentUser = req.user ? req.user.id : null;
        if (currentUser) {
            isOrganizerOrCoHost = currentUser === group.organizerId || group.Memberships.some(m => m.userId === currentUser && m.status === 'co-host');
        }
        const members = group.Memberships.reduce((acc, membership) => {
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

// group validation
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

// venue validation
const validateVenue = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
];

// event validation
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

// POST /api/groups - create a new group
router.post('/', validateGroup, async (req, res, next) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Bad Request",
            errors: errors.mapped()
        });
    }

    const t = await sequelize.transaction(); 

    try {
        const group = await Group.create({
            organizerId: user.id,
            name,
            about,
            type,
            private,
            city,
            state,
        }, { transaction: t });

        // Create a membership for the organizer
        await Membership.create({
            userId: user.id,
            groupId: group.id,
            status: 'co-host' // or 'organizer' depending on your logic
        }, { transaction: t });

        await t.commit(); 

        return res.status(201).json(group);
    } catch (error) {
        await t.rollback(); 
        next(error);
    }
});

// POST /api/groups/:groupId/images - adds an image to a group
router.post('/:groupId/images', authenticated, async (req, res) => {
    const { groupId } = req.params;
    const { url, preview } = req.body;

    try {
        const group = await Group.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (group.organizerId !== req.user.id) {
            return res.status(403).json({ message: "Forbidden. You are not authorized to add an image to this group." });
        }

        const groupImage = await GroupImage.create({
            groupId,
            url,
            preview
        });

        res.status(201).json(groupImage);
    } catch (error) {
        console.error('Error adding image to group:', error);
        return res.status(500).json({ message: 'Internal server error', errors: error.errors ? error.errors.map(e => e.message) : [error.message] });
    }
});

// POST /api/groups/:groupId/venues - creates a new venue for a group
router.post('/:groupId/venues', authenticated, validateVenue, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    try {
        const group = await Group.findByPk(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (group.organizerId !== req.user.id) { 
            return res.status(403).json({ message: "Forbidden. You need to be the organizer to add venues." });
        }

        const venue = await Venue.create({
            groupId,
            address,
            city,
            state,
            lat,
            lng
        });

        res.status(200).json(venue);
    } catch (error) {
        console.error('Error creating venue for group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/groups/:groupId/events - create an event for a specific group
router.post('/:groupId/events', authenticated, validateEvent, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { name, type, startDate, endDate, venueId, description, capacity, price } = req.body;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }
        const venue = await Venue.findByPk(venueId);
        if (!venueId) {
            return res.status(400).json({ message: "Venue ID is required" });
        }
        if (!venue) {
            return res.status(404).json({ message: "Venue couldn't be found" });
        }
        if (req.user.id !== group.organizerId) {
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

// POST /api/groups/:groupId/membership - request membership for a group
router.post('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findByPk(groupId, {
            include: {
                model: User,
                as: 'Organizer'
            }
        });

        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (userId === group.organizerId) {
            return res.status(400).json({ message: "User is already a member of the group" });
        }

        const existingMembership = await Membership.findOne({
            where: {
                groupId: groupId,
                userId: userId
            }
        });

        if (existingMembership) {
            if (existingMembership.status === 'pending') {
                return res.status(400).json({ message: "Membership has already been requested" });
            } else if (existingMembership.status === 'member') {
                return res.status(400).json({ message: "User is already a member of the group" });
            }
        }

        const membership = await Membership.create({
            userId: userId,
            groupId: groupId,
            status: 'pending'
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

// PUT /api/groups/:groupId - updates a group
router.put('/:groupId', authenticated, validateGroup, handleValidationErrors, async (req, res) => {
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;

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
            private,
            city,
            state,
        });

        res.status(200).json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT /api/groups/:groupId/membership - change the status of a membership for a group
router.put('/:groupId/membership', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;
    const { memberId, status } = req.body;
    const userId = req.user.id;

    try {
        const group = await Group.findByPk(groupId, {
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

        const user = await User.findByPk(memberId);
        if (!user) {
            return res.status(404).json({ message: "User couldn't be found" });
        }

        const membership = group.Memberships.find(m => m.userId === memberId);
        if (!membership) {
            return res.status(404).json({ message: "Membership between the user and the group does not exist" });
        }

        if (status === 'pending') {
            return res.status(400).json({
                message: "Bad Request",
                errors: { "status": "Cannot change a membership status to pending" }
            });
        }

        if (membership.status === 'pending' && status === 'member') {
            if (!(userId === group.organizerId || group.Memberships.some(m => m.userId === userId && m.status === 'co-host'))) {
                return res.status(403).json({ message: "Forbidden: You are not authorized to change the membership status" });
            }
        }

        if (membership.status === 'member' && status === 'co-host') {
            if (userId !== group.organizerId) {
                return res.status(403).json({ message: "Forbidden: Only the organizer can change a member to a co-host" });
            }
        }

        membership.status = status;
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

// DELETE /api/groups/:groupId - deletes a group
router.delete('/:groupId', restoreUser, requireAuth, async (req, res) => {
    const { groupId } = req.params;

    const t = await sequelize.transaction();

    try {
        const group = await Group.findByPk(groupId, { transaction: t });
        if (!group) {
            await t.rollback();
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        if (req.user.id !== group.organizerId) {
            await t.rollback();
            return res.status(403).json({ message: "Forbidden: You are not allowed to delete this group" });
        }

        await GroupImage.destroy({ where: { groupId }, transaction: t });
        await Event.destroy({ where: { groupId }, transaction: t });
        await Venue.destroy({ where: { groupId }, transaction: t });
        await Membership.destroy({ where: { groupId }, transaction: t });
        await group.destroy({ transaction: t });
        await t.commit();

        return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        await t.rollback();
        console.error('Failed to delete group:', error);
        return res.status(500).json({ message: 'Internal server error', errors: error.errors ? error.errors.map(e => e.message) : [error.message] });
    }
});

// DELETE /api/groups/:groupId/membership/:memberId - delete a membership to a group
router.delete('/:groupId/membership/:memberId', restoreUser, requireAuth, async (req, res) => {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const user = await User.findByPk(memberId);
        if (!user) {
            return res.status(404).json({ message: "User couldn't be found" });
        }

        const membership = await Membership.findOne({
            where: {
                groupId: groupId,
                userId: memberId
            }
        });

        if (!membership) {
            return res.status(404).json({ message: "Membership does not exist for this User" });
        }

        if (userId !== group.organizerId && userId !== parseInt(memberId)) {
            return res.status(403).json({ message: "Forbidden: You are not allowed to delete this membership" });
        }

        await membership.destroy();

        return res.status(200).json({
            message: "Successfully deleted membership from group"
        });
    } catch (error) {
        console.error('Failed to delete membership:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
