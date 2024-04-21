'use strict';

const { User } = require('../models'); // imports user model from model directory
const bcrypt = require("bcryptjs"); // imports the bcryptjs library for password hashing

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([
      {
        email: 'demo@user.io',
        username: 'Demo',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Demo',
        lastName: 'User',
      },
      {
        email: 'fakeuser01@user.io',
        username: 'Fakeuser01',
        hashedPassword: bcrypt.hashSync('password01'),
        firstName: 'Fake1',
        lastName: 'User2',
      },
      {
        email: 'fakeuser02@user.io',
        username: 'Fakeuser02',
        hashedPassword: bcrypt.hashSync('password02'),
        firstName: 'Fake2',
        lastName: 'User2',
      }
    ], { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users'; // specify the table to operate on
    const Op = Sequelize.Op; // retrive Sequelize operator shortcuts for use in queries
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo', 'Fakeuser01', 'Fakeuser02'] }
    }, {}); // remove user records where the username matches specified values
  }
};

