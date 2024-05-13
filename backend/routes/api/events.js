const express = require('express');
const router = express.Router();
const { Event, Group, User, Membership, Attendance, EventImage, Venue } = require('../../db/models'); // Adjust the path as needed
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation'); 

router.use(restoreUser); 

const authenticated = [restoreUser, requireAuth]; 

// GET /api/events - Returns all events
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

// GET /api/events/:eventId - Returns details of a specified event
router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findByPk(eventId, {
            include: [
            {
                model: Group,
                as: 'Group',
                attributes: ['id', 'name', 'city', 'state', 'private']
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

    const isOrganizer = req.user.id === event.Group.organizerId; // check if the current user is the organizer or a co-host
    const isCoHost = event.Group.Memberships.some(membership => membership.status === 'co-host');

    if (!isOrganizer && !isCoHost) {
        return res.status(403).json({ message: "Forbidden: You are not allowed to edit this event" });
    }
    next(); // if allowed, move to the next middleware/function
};

// Event validation
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

// POST /api/events/:eventId/images - Add an image to an event
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

// PUT /api/events/:eventId - Edit an event
router.put('/:eventId', authenticated, checkEventPermission, validateEvent, handleValidationErrors, async (req, res) => {
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;

    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event couldn't be found" });
        }

        const venue = await Venue.findByPk(venueId); // check if the venue exists
        if (!venue) {
            return res.status(404).json({ message: "Venue couldn't be found" });
        }

        const start = new Date(startDate); // convert startDate and endDate from string to Date objects
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) { // validate the converted dates
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (start >= end) {
            return res.status(400).json({ message: "End date must be after start date" });
        }
        if (start < new Date()) {
            return res.status(400).json({ message: "Start date must be in the future" });
        }


        await event.update({  // update the event
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

module.exports = router;