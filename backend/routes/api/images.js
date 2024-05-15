const express = require('express');
const { GroupImage, EventImage, Group, Event, Membership } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// DELETE /api/images/group/:imageId - delete group image
router.delete('/group/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    const groupImage = await GroupImage.findByPk(imageId, { 
        include: {
            model: Group,
            as: 'Group'
        }
    });

    if (!groupImage) {
      return res.status(404).json({ message: "Group Image couldn't be found" }); 
    }

    const isOrganizer = groupImage.Group.organizerId === userId; 
    const membership = await Membership.findOne({ where: { groupId: groupImage.groupId, userId, status: 'co-host' } });
    const isCoHost = membership !== null; 

    if (!isOrganizer && !isCoHost) {
      return res.status(403).json({ message: "Forbidden" }); 
    }

  await groupImage.destroy(); 

  res.status(200).json({ message: "Successfully deleted" });
});

// DELETE /api/images/event/:imageId - delete event image
router.delete('/event/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

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
      return res.status(404).json({ message: "Event Image couldn't be found" }); 
    }


    const isOrganizer = eventImage.Event.Group.organizerId === userId; 
    const membership = await Membership.findOne({ where: { groupId: eventImage.Event.groupId, userId, status: 'co-host' } });
    const isCoHost = membership !== null; 

    if (!isOrganizer && !isCoHost) {
      return res.status(403).json({ message: "Forbidden" }); 
    }

    await eventImage.destroy(); 

    res.status(200).json({ message: "Successfully deleted" }); 
});

module.exports = router;
