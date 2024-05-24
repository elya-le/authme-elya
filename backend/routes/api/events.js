const express = require('express');
const router = express.Router();
const { Event, Group, User, Membership, Attendance, EventImage, Venue } = require('../../db/models'); // Adjust the path as needed
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const { where } = require('sequelize');

router.use(restoreUser);

const authenticated = [restoreUser, requireAuth];

// GET /api/events - returns all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.findAll({
            include: [
                {
                    model: Group,
                    as: 'Group',
                    attributes: ['id', 'name', 'city', 'state']
                },
                {
                    model: Venue,
                    as: 'Venue',
                    attributes: ['id', 'city', 'state']
                },
                {
                    model: Attendance,
                    as: 'Attendances',
                    attributes: []
                }
            ],
            attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'startDate', 'endDate', 'previewImage', [sequelize.fn('COUNT', sequelize.col('Attendances.id')), 'numAttending']],
            group: ['Event.id', 'Group.id', 'Venue.id']
        });

        res.status(200).json({ Events: events });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/events/:eventId - returns details of a specified event
router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findByPk(eventId, {
            include: [
                {
                    model: Group,
                    as: 'Group',
                    attributes: ['id', 'name', 'city', 'state', 'private', 'organizerId'] 
                },
                {
                    model: Venue,
                    as: 'Venue',
                    attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
                },
                {
                    model: Attendance,
                    as: 'Attendances',
                    attributes: ['id']
                },
                {
                    model: EventImage,
                    as: 'EventImages',
                    attributes: ['id', 'url', 'preview']
                }
            ]
        });

        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        event.dataValues.numAttending = event.Attendances.length;

        res.status(200).json(event);
    } catch (error) {
        console.error('Failed to fetch event details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// GET /api/events - add query filters
router.get('/', async (req, res) => {
    const { page = 1, size = 20, name, type, startDate } = req.query;

    const errors = {};
    if (isNaN(page) || page < 1 || page > 10) errors.page = 'Page must be between 1 and 10';
    if (isNaN(size) || size < 1 || size > 20) errors.size = 'Size must be between 1 and 20';
    if (name && typeof name !== 'string') errors.name = 'Name must be a string';
    if (type && !['Online', 'In Person'].includes(type)) errors.type = "Type must be 'Online' or 'In Person'";
    if (startDate && isNaN(Date.parse(startDate))) errors.startDate = 'Start date must be a valid datetime';

    if (Object.keys(errors).length) return res.status(400).json({ message: 'Bad Request', errors });

    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (type) where.type = type;
    if (startDate) where.startDate = { [Op.gte]: new Date(startDate) };

    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    try {
        const events = await Event.findAll({
            where,
            include: [
                { model: Group, attributes: ['id', 'name', 'city', 'state'] },
                { model: Venue, attributes: ['id', 'city', 'state'] },
                { model: Attendance, attributes: ['id'] },
            ],
            limit,
            offset,
        });

        return res.json({ Events: events });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// middleware to check if the current user can edit the event
const checkEventPermission = async (req, res, next) => {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId, {
        include: {
            model: Group,
            as: 'Group',
            include: [
                {
                    model: User,
                    as: 'Organizer',
                },
                {
                    model: Membership,
                    as: 'Memberships',
                    where: {
                        userId: req.user.id,
                    },
                    required: false
                }
            ]
        }
    });

    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const isOrganizer = req.user.id === event.Group.organizerId;
    const isCoHost = event.Group.Memberships.some(membership => membership.status === 'co-host');

    if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: "Forbidden: You are not allowed to edit this event" });
    }
    next();
};

// GET /api/events/:eventId/attendees - get all attendees for an event
router.get('/:eventId/attendees', async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user ? req.user.id : null;

    const event = await Event.findByPk(eventId, {
        include: {
            model: Group,
            as: 'Group',
            include: {
                model: Membership,
                as: 'Memberships',
                where: {
                    userId: userId,
                    status: ['member', 'inactive', 'pending']
                },
                required: false
            }
        }
    });
    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const attendees = await Attendance.findAll({
        where: { eventId },
        include: {
            model: User,
            as: 'User',
            attributes: ['id', 'firstName', 'lastName']
        }
    });
    let responseAttendees;
    const isAuthorized = event.Group && event.Group.Memberships && event.Group.Memberships.length > 0;

    if (isAuthorized) {
        responseAttendees = attendees.map(att => ({
            id: att.User.id,
            firstName: att.User.firstName,
            lastName: att.User.lastName,
            Attendance: { status: att.status }
        }));
    } else {
        responseAttendees = attendees
            .filter(att => att.status !== 'pending')
            .map(att => ({
                id: att.User.id,
                firstName: att.User.firstName,
                lastName: att.User.lastName,
                Attendance: { status: att.status }
            }));
    }
    res.status(200).json({ Attendees: responseAttendees });
});

// event validation
const validateEvent = [
    check('name', 'Name must be at least 5 characters long').isLength({ min: 5 }),
    check('type', "Type must be 'Online' or 'In person'").isIn(['Online', 'In person', 'online', 'in person']),
    check('capacity', 'Capacity must be an integer').isInt({ min: 1 }),
    check('price', 'Price must be a non-negative number').isFloat({ min: 0 }),
    check('description', 'Description is required').not().isEmpty(),
    check('startDate', 'Start date must be in the format YYYY-MM-DD HH:mm:ss')
        .matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        .custom((value, { req }) => new Date(value) > new Date()),
    check('endDate', 'End date must be in the format YYYY-MM-DD HH:mm:ss and after start date')
        .matches(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
        .custom((value, { req }) => new Date(value) > new Date(req.body.startDate)),
    check('venueId', 'Venue ID must be an integer').isInt()
];

// POST /api/events/:eventId/attendance - attend an event based on event id
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId, {
        include: {
            model: Group,
            as: 'Group'
        }
    });

    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const membership = await Membership.findOne({ where: { groupId: event.groupId, userId } });
    if (!membership) {
        return res.status(403).json({ message: "You must be a member of the group to request attendance" });
    }

    const existingAttendance = await Attendance.findOne({ where: { eventId, userId } });
    if (existingAttendance) {
        if (existingAttendance.status === 'pending') {
            return res.status(400).json({ message: "Attendance has already been requested" });
        }
        if (existingAttendance.status === 'attending') {
            return res.status(400).json({ message: "User is already an attendee of the event" });
        }
    }

    const attendance = await Attendance.create({
        eventId,
        userId,
        status: 'pending'
    });

    res.status(200).json({
        userId: attendance.userId,
        status: attendance.status
    });
});

// POST /api/events/:eventId/images - add an image to an event
router.post('/:eventId/images', restoreUser, requireAuth, [
    check('url')
        .exists({ checkFalsy: true }).withMessage('Image URL is required')
        .isURL().withMessage('Image URL must be a valid URL'),
    check('preview')
        .isBoolean().withMessage('Preview must be a boolean')
], handleValidationErrors, async (req, res) => {
    const { url, preview } = req.body;
    const { eventId } = req.params;

    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        const image = await EventImage.create({
            eventId,
            url,
            preview
        });

        return res.status(200).json(image);
    } catch (error) {
        console.error('Failed to add image to event:', error);
        return res.status(500).json({ message: 'Internal server error', errors: error.errors.map(e => e.message) });
    }
});

// PUT /api/events/:eventId - edit an event
router.put('/:eventId', authenticated, checkEventPermission, validateEvent, handleValidationErrors, async (req, res) => {
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }
        const venue = await Venue.findByPk(venueId);
        if (!venue) {
            return res.status(404).json({ message: "Venue couldn't be found" });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (start >= end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }
        if (start < new Date()) {
            return res.status(400).json({ message: "Start date must be in the future" });
        }

        await event.update({
            venueId,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate
        });

        res.status(200).json(event);
    } catch (error) {
        console.error('Failed to edit event:', error);
        res.status(500).json({ message: 'Internal server error', errors: error.errors.map(e => e.message) });
    }
});

// check if the current user can delete the event
const checkEventDeletionPermission = async (req, res, next) => {
    const { eventId } = req.params;
    try {
        const event = await Event.findByPk(eventId, {
            include: [{
                model: Group,
                as: 'Group',
                include: [
                    { model: User, as: 'Organizer' },
                    { model: Membership, as: 'Memberships' }
                ]
            }]
        });

        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        if (req.user.id === event.Group.Organizer.id ||
            event.Group.Memberships.some(membership => membership.userId === req.user.id && membership.status === 'co-host')) {
            return next();
        }

        return res.status(403).json({ message: "Forbidden: You are not authorized to delete this event" });
    } catch (error) {
        console.error('Error checking event deletion permission:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// PUT /api/events/:eventId/attendance - change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    const { eventId } = req.params;
    const { userId, status } = req.body;
    const currentUserId = req.user.id;

    if (status === 'pending') {  // validate the new status
        return res.status(400).json({
            message: "Bad Request",
            errors: { status: "Cannot change an attendance status to pending" }
        });
    }

    try {
        const event = await Event.findByPk(eventId, { // fetch the event along with its associated group and organizer
            include: {
                model: Group,
                as: 'Group',
                include: {
                    model: User,
                    as: 'Organizer'
                }
            }
        });

        if (!event) { // check if the event exists
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        const user = await User.findByPk(userId); // fetch the user to ensure they exist
        if (!user) {
            return res.status(404).json({ message: "User couldn't be found" });
        }

        const attendance = await Attendance.findOne({ where: { eventId, userId } }); // fetch the attendance record
        if (!attendance) {
            return res.status(404).json({ message: "Attendance between the user and the event does not exist" });
        }
        const membership = await Membership.findOne({ where: { groupId: event.groupId, userId: currentUserId } }); // fetch the current user's membership in the group

        const isOrganizer = currentUserId === event.Group.organizerId; // check if the current user is authorized to update the attendance
        const isCoHost = membership && membership.status === 'co-host';

        if (!isOrganizer && !isCoHost) {
            return res.status(403).json({ message: "Forbidden" });
        }

        attendance.status = status; // update the attendance status
        await attendance.save();

        return res.status(200).json({ // return the updated attendance details
            id: attendance.id,
            eventId: attendance.eventId,
            userId: attendance.userId,
            status: attendance.status
        });
    } catch (error) {
        console.error('Failed to change attendance status:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// DELETE /api/events/:eventId/attendance/:userId - delete attendance to an event
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    const { eventId, userId } = req.params;
    const currentUserId = req.user.id;

    const event = await Event.findByPk(eventId, {
        include: {
            model: Group,
            as: 'Group'
        }
    });

    if (!event) {
        return res.status(404).json({ message: "Event couldn't be found" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
        return res.status(404).json({ message: "User couldn't be found" });
    }

    const attendance = await Attendance.findOne({ where: { eventId, userId } });
    if (!attendance) {
        return res.status(404).json({ message: "Attendance does not exist for this User" });
    }

    const isHost = event.Group.organizerId === currentUserId;
    const isSelf = userId == currentUserId;

    if (!isHost && !isSelf) {
        return res.status(403).json({ message: "Forbidden" });
    }

    await attendance.destroy();

    res.status(200).json({ message: "Successfully deleted attendance from event" });
});

// DELETE /api/events/:eventId - deletes an event
router.delete('/:eventId', restoreUser, requireAuth, checkEventDeletionPermission, async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        await event.destroy();
        return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
        console.error('Failed to delete event:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;