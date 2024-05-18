'use strict';
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // Use schema only in production
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: 'Users', schema: options.schema }, // Use schema if available
      [
        {
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@user.io',
          username: 'Demo-User',
          hashedPassword: bcrypt.hashSync('password', 10),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: 'Demo',
          lastName: 'User2',
          email: 'demo2@user.io',
          username: 'Demo-User2',
          hashedPassword: bcrypt.hashSync('password2'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          firstName: 'Demo',
          lastName: 'User3',
          email: 'demo3@user.io',
          username: 'Demo-User3',
          hashedPassword: bcrypt.hashSync('password3'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'Users', schema: options.schema }, // Use schema if available
      {
        username: {
          [Sequelize.Op.in]: ['Demo-User', 'Demo-User2', 'Demo-User3'],
        },
      }
    );
  },
};
