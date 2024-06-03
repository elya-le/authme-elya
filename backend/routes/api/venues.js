const express = require('express');
const router = express.Router();
const { Venue, Group } = require('../../db/models');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');

const validateVenue = [
  check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required')
    .isLength({ min: 2, max: 2 }).withMessage('State must be 2 characters'),
  check('lat').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
  check('lng').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
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

// POST /api/venues - create a new venue
router.post('/', restoreUser, requireAuth, validateVenue, handleValidationErrors, async (req, res) => {
  const { address, city, state, lat, lng, groupId } = req.body;

  console.log('Received venue creation request:', { address, city, state, lat, lng, groupId });
  console.log('User:', req.user);

  try {
    const group = await Group.findByPk(groupId);
    if (!group) {
      console.log("Group couldn't be found");
      return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (req.user.id !== group.organizerId) {
      console.log('Forbidden: User is not authorized to create a venue for this group');
      return res.status(403).json({ message: "Forbidden: You are not authorized to create a venue for this group" });
    }
    const venue = await Venue.create({
      address,
      city,
      state,
      lat: lat !== undefined ? lat : null,
      lng: lng !== undefined ? lng : null,
      groupId
    });
    console.log('Venue created successfully:', venue);
    return res.status(201).json(venue);
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/venues/:venueId - edits a venue specified by its id
router.put('/:venueId', restoreUser, requireAuth, validateVenue, handleValidationErrors, async (req, res) => {
  const { venueId } = req.params;
  const { address, city, state, lat, lng } = req.body;

  console.log('Received venue update request:', { venueId, address, city, state, lat, lng });
  console.log('User:', req.user);

  try {
    const venue = await Venue.findByPk(venueId, {
      include: {
        model: Group,
        as: 'Group'
      }
    });
    if (!venue) {
      console.log("Venue couldn't be found");
      return res.status(404).json({ message: "Venue couldn't be found" });
    }
    const group = venue.Group;
    if (!group) {
      console.log("Group couldn't be found");
      return res.status(404).json({ message: "Group couldn't be found" });
    }
    if (req.user.id !== group.organizerId) {
      console.log('Forbidden: User is not authorized to update this venue');
      return res.status(403).json({ message: "Forbidden: You are not authorized to update this venue" });
    }
    const updatedVenue = await venue.update({
      address,
      city,
      state,
      lat: lat !== undefined ? lat : null,
      lng: lng !== undefined ? lng : null
    });
    console.log('Venue updated successfully:', updatedVenue);
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
