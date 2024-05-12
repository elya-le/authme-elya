const express = require('express');
const router = express.Router();
const { Event, Group, Venue, Attendance } = require('../../db/models');
const { check, validationResult } = require('express-validator');
const { restoreUser, requireAuth } = require('../../utils/auth');

router.use(restoreUser); 

const authenticated = [restoreUser, requireAuth]; 

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
                attributes: ['id']
            }
        ],
        attributes: ['id', 'groupId', 'venueId', 'name', 'type', 'startDate', 'endDate', 'previewImage']
    });

        const enhancedEvents = events.map(event => ({
        ...event.get({ plain: true }),
        numAttending: event.Attendances.length
    }));

    res.status(200).json({ Events: enhancedEvents });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;