const express = require('express');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { User } = require('../../db/models');
const { setTokenCookie, restoreUser } = require('../../utils/auth');

// GET /api/session - return the current user
router.get('/', restoreUser, (req, res) => {
  if (req.user) {
    return res.json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        username: req.user.username
      }
    });
  } else {
    return res.json({ user: null });
  }
});

// POST /api/session - logging in a user
router.post('/',
  [
    body('credential').not().isEmpty().withMessage('Email or username is required'),
    body('password').not().isEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors.array().reduce((acc, error) => ({
            ...acc,
            [error.param]: error.msg
          }), {})
        });
      }
      const { credential, password } = req.body;
      const normalizedCredential = credential.toLowerCase(); // normalize credential for comparison
      const user = await User.findOne({
        where: {
          [Op.or]: [
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), normalizedCredential),
            Sequelize.where(Sequelize.fn('lower', Sequelize.col('username')), normalizedCredential)
          ]
        },
        attributes: ['id', 'email', 'username', 'firstName', 'lastName', 'hashedPassword']
      });
      if (user) {
        const hashedPassword = user.hashedPassword.toString(); // get user's hashed password
        if (bcrypt.compareSync(password, hashedPassword)) { // compare provided password with stored hash
          const token = setTokenCookie(res, user); // set token cookie

          return res.json({
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              username: user.username
            }
          });
        }
      }
      return res.status(401).json({
        message: 'Invalid credentials' // return invalid credentials error
      });
    } catch (error) {
      console.error('Error during login:', error); // log error
      return res.status(500).json({
        message: 'Internal Server Error' // return server error
      });
    }
  });

// logout route
router.delete('/', (req, res) => {
  res.clearCookie('token'); // clear token cookie
  res.status(200).json({ message: 'Logout successful' }); // return logout success message
});

// 403 Error Handling
router.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({
      message: 'Invalid CSRF token'
    });
  } else {
    next(err);
  }
});

module.exports = router;
