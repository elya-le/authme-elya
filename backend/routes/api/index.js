const express = require('express');
const router = express.Router();

const sessionRouter = require('./session');
const usersRouter = require('./users');
const groupsRouter = require('./groups');
const eventsRouter = require('./events');
const imagesRouter = require('./images');
const venueRouter = require('./venues');

const { restoreUser } = require("../../utils/auth");

router.use(restoreUser);

router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/groups', groupsRouter);
router.use('/venues', venueRouter);
router.use('/images', imagesRouter);
router.use('/events', eventsRouter);

router.post('/test', (req, res) => {
  res.json({ requestBody: req.body });
});

module.exports = router;