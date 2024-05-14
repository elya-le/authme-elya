const express = require('express');
const { GroupImage, EventImage, Group, Event, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// DELETE /api/images/group/:imageId
router.delete('/group/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    const groupImage = await GroupImage.findByPk(imageId, { // find the group image by id
        include: {
            model: Group,
            as: 'Group'
        }
    });

    if (!groupImage) {
      return res.status(404).json({ message: "Group Image couldn't be found" }); // image not found
    }

    // check authorization
    const isOrganizer = groupImage.Group.organizerId === userId; // check if current user is the organizer
    const membership = await Membership.findOne({ where: { groupId: groupImage.groupId, userId, status: 'co-host' } });
    const isCoHost = membership !== null; // check if current user is a co-host

    if (!isOrganizer && !isCoHost) {
      return res.status(403).json({ message: "Forbidden" }); // not authorized
    }

  await groupImage.destroy(); // delete the group image

  res.status(200).json({ message: "Successfully deleted" }); // success response
});

// DELETE /api/images/event/:imageId
router.delete('/event/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    // find the event image by id
    const eventImage = await EventImage.findByPk(imageId, {
        include: {
            model: Event,
            as: 'Event',
            include: {
                model: Group,
                as: 'Group'
            }
        }
    });

    if (!eventImage) {
      return res.status(404).json({ message: "Event Image couldn't be found" }); // image not found
    }

    // check authorization
    const isOrganizer = eventImage.Event.Group.organizerId === userId; // check if current user is the organizer
    const membership = await Membership.findOne({ where: { groupId: eventImage.Event.groupId, userId, status: 'co-host' } });
    const isCoHost = membership !== null; // check if current user is a co-host

    if (!isOrganizer && !isCoHost) {
      return res.status(403).json({ message: "Forbidden" }); // not authorized
    }

    await eventImage.destroy(); // delete the event image

    res.status(200).json({ message: "Successfully deleted" }); // success response
});

module.exports = router;
