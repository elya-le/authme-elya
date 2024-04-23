const express = require('express');
const { Op, where } = require('sequelize');
const {
    Group,
    Venue,
    User,
    GroupImage,
    Membership,
    Event,
    EventImage,
} = require('../../db/models');

const router = express.Router()

// GET

