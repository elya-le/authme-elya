'use strict';

const { Attendance } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Attendances', [
      {
        eventId: 1, 
        userId: 1, 
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 1,
        userId: 2,
        status: 'canceled',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2, 
        userId: 2,
        status: 'confirmed',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    return queryInterface.bulkDelete(options);
  },
};
