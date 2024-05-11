'use strict';

const { Venue } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Venues',
      [
        {
          groupId: 1,
          address: 'Times Square',
          city: 'Manhattan',
          state: 'NY',
          lat: 40.7580,
          lng: -73.9855,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 2,
          address: 'Sheep Meadow E 65th St',
          city: 'New York',
          state: 'NY',
          lat: 40.7694,
          lng: -73.9776,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 3,
          address: 'Tuxedo 600 Route 17a',
          city: 'Tuxedo Park',
          state: 'NY',
          lat: 41.2009,
          lng: -74.2400,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Venues";
    return queryInterface.bulkDelete(options);
  },
};
