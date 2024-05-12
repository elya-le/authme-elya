'use strict';

const { Membership } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Memberships', [
      {
        userId: 1, 
        groupId: 1, 
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 2, 
        groupId: 1,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        groupId: 2,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Memberships';
    return queryInterface.bulkDelete(options);
  },
};
