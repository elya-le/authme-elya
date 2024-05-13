const express = require('express');
const router = express.Router();
const { Event, Group, Venue, Attendance } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { sequelize } = require('../../db/models');

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

module.exports = router;