'use strict';

const { GroupImage } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('GroupImages', 
      [
        {
          id: 1,
          url: 'http://example.com/path/to/image1.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          url: 'http://example.com/path/to/image2.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          url: 'http://example.com/path/to/image3.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('GroupImages', null, {});
  },
};
