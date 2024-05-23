'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // set schema in production
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'Venues', schema: options.schema },
      [
        { // 1
          groupId: 1,
          address: 'Times Square',
          city: 'Manhattan',
          state: 'NY',
          lat: 40.757946,
          lng: -73.985535,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 2
          groupId: 1,
          address: 'Central Park',
          city: 'New York',
          state: 'NY',
          lat: 40.785091,
          lng: -73.968285,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 3
          groupId: 1,
          address: '123 Skyline Ave',
          city: 'New York',
          state: 'NY',
          lat: 40.748817,
          lng: -73.985428,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 4
          groupId: 2,
          address: 'Sheep Meadow E 65th St',
          city: 'New York',
          state: 'NY',
          lat: 40.7694,
          lng: -73.9776,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 5
          groupId: 2,
          address: 'Brighton Beach',
          city: 'Brooklyn',
          state: 'NY',
          lat: 40.5774,
          lng: -73.9619,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 6
          groupId: 2,
          address: 'Rockaway Beach',
          city: 'Queens',
          state: 'NY',
          lat: 40.5860,
          lng: -73.8169,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 3, 
          address: '600 NY',
          city: 'Tuxedo Park',
          state: 'NY',
          lat: 41.24948,
          lng: -74.22731,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 7
          groupId: 2,
          address: 'Hunter Point South Dog Run',
          city: 'Queens',
          state: 'NY',
          lat: 40.7440,
          lng: -73.9580,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 8
          groupId: 3,
          address: 'Domino Park',
          city: 'Brooklyn',
          state: 'NY',
          lat: 40.713197,
          lng: -73.968591,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 9
          groupId: 3,
          address: 'Prospect Park',
          city: 'Brooklyn',
          state: 'NY',
          lat: 40.6602,
          lng: -73.9690,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 10
          groupId: 3,
          address: 'Barking Dog Restaurant',
          city: 'New York',
          state: 'NY',
          lat: 40.7808,
          lng: -73.9512,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { // 11
          groupId: 3,
          address: 'Riverside Park',
          city: 'New York',
          state: 'NY',
          lat: 40.8015,
          lng: -73.9712,
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
          [Sequelize.Op.in]: [
            'Times Square', 
            'Central Park', 
            '123 Skyline Ave', 
            'Sheep Meadow E 65th St', 
            'Brighton Beach', 
            'Rockaway Beach', 
            '600 NY', 
            'Hunter Point South Dog Run', 
            'Domino Park', 
            'Prospect Park', 
            'Barking Dog Restaurant', 
            'Riverside Park'
          ],
        },
      }
    );
  },
};
