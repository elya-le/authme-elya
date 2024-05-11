const express = require('express');
const router = express.Router();
const { Venue, Group, Membership } = require('../../db/models');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const validateVenue = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters')
        .isUppercase().withMessage('State must be uppercase'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
];

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

router.put('/:venueId', restoreUser, requireAuth, validateVenue, handleValidationErrors, async (req, res) => {
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    try {
        const venue = await Venue.findByPk(venueId, {
            include: [{
                model: Group,
                as: 'Group',
                include: [{
                    model: Membership,
                    as: 'Memberships',
                    where: { userId: req.user.id },
                    required: false
                }]
            }]
        });

        if (!venue) {
            return res.status(404).json({ message: "Venue couldn't be found" });
        }

        const group = venue.Group;
        const isOrganizer = group.organizerId === req.user.id;
        const isCoHost = group.Memberships.some(membership => membership.userId === req.user.id && membership.status === 'co-host');

        if (!isOrganizer && !isCoHost) {
            return res.status(403).json({ message: "Forbidden. You need to be the organizer or a co-host to edit venues." });
        }

        const updatedVenue = await venue.update({ address, city, state, lat, lng });
        res.status(200).json(updatedVenue);
    } catch (error) {
        console.error('Error updating venue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
