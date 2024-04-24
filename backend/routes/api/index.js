const express = require("express");
const router = express.Router();

const sessionRouter = require("./session");
const usersRouter = require("./users");
const groupsRouter = require("./groups");
// const venueRouter = require("./venues");
// const eventsRouter = require("./events");


const { restoreUser } = require("../../utils/auth");

// if current user session is valid, set req.user to the user in the database
// if current user session is not valid, set req.user to null
router.use(restoreUser);

router.use("/session", sessionRouter);
router.use("/users", usersRouter);
router.use("/groups", groupsRouter);
// router.use("/venues", venueRouter);
// router.use("/events", eventsRouter);


router.post("/test", (req, res) => {
    res.json({ requestBody: req.body });
});

module.exports = router;