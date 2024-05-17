'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'Venues', schema: options.schema },
      [
        {
          groupId: 1,
          address: 'Times Square',
          city: 'Manhattan',
          state: 'NY',
          lat: 40.757946,
          lng: -73.985535,
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
          address: 'Domino Park',
          city: 'Brooklyn',
          state: 'NY',
          lat: 40.713197,
          lng: -73.968591,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      { validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'Venues', schema: options.schema },
      {
        address: {
          [Sequelize.Op.in]: ['Times Square', 'Sheep Meadow E 65th St', 'Domino Park'],
        },
      }
    );
  },
};

