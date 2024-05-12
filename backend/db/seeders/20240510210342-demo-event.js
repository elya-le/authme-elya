'use strict';

const { Event } = require('../models');
const bcrypt = require('bcryptjs');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Events',
      [
        {
          venueId: 1,
          groupId: 1,
          name: 'Low Rider Limbo',
          description: 'How low can they go? Find out with a limbo contest agility course tailored for those close to the ground.',
          type: 'In person',
          capacity: 50,
          price: 10,
          startDate: new Date(),
          endDate: new Date(new Date().setHours(new Date().getHours() + 3)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          venueId: 2,
          groupId: 2,
          name: '2nd Annual Brush your Chow at the Park day',
          description: 'Welcome the warmer weather with a fluff-fest -Join us to get ahead of the shedding season and keep those fur clouds under control! ',
          type: 'In person',
          capacity: 100,
          price: 5,
          startDate: new Date(),
          endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          venueId: 3,
          groupId: 3,
          name: 'Hound Day - NY Ren Faire',
          description: "Step back in time with your noble hounds at the NY's Renaissance fair extravaganza. Dress your pups in their medieval best to compete in categories such as 'Most Regal Attire', 'Best Historical Duo' (for owners and pets in matching costumes), and 'Court Jester'. Celebrate with us in a day of jousting displays, minstrel music, and feasting fit for a Kings best friend.",
          type: 'In person',
          capacity: 75,
          price: 15,
          startDate: new Date(),
          endDate: new Date(new Date().setHours(new Date().getHours() + 4)),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Events';
    return queryInterface.bulkDelete(options);
  },
};
