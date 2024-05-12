'use strict';

const { User } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('EventImages', 
      [
        {
          id: 1,
          url: 'http://example.com/path/to/event1image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          url: 'http://example.com/path/to/event2image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          url: 'http://example.com/path/to/event3image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('EventImages', null, {});
  },
};
