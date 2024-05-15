const express = require('express');
const router = express.Router();
const { Venue, Group } = require('../../db/models');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const validateVenue = [
    check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
    check('city').exists({ checkFalsy: true }).withMessage('City is required'),
    check('state').exists({ checkFalsy: true }).withMessage('State is required')
        .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
];
// middleware for validation errors
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

// PUT /api/venues/:venueId - edits a venue specified by its id
router.put('/:venueId', restoreUser, requireAuth, validateVenue, handleValidationErrors, async (req, res) => {
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;

    try {
        const venue = await Venue.findByPk(venueId, {
            include: {
                model: Group,
                as: 'Group'
            }
        });

        if (!venue) {
            return res.status(404).json({ message: "Venue couldn't be found" });
        }

        const group = venue.Group;
        if (!group) {
            return res.status(404).json({ message: "Group couldn't be found" });
        }

        const updatedVenue = await venue.update({
            address,
            city,
            state,
            lat,
            lng
        });

        const response = {
            id: updatedVenue.id,
            groupId: updatedVenue.groupId,
            address: updatedVenue.address,
            city: updatedVenue.city,
            state: updatedVenue.state,
            lat: updatedVenue.lat,
            lng: updatedVenue.lng
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error updating venue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;