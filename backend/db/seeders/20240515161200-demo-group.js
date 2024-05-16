'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Groups',
      [
        {
          id: 1,  // Ensure these IDs are unique and consistent
          organizerId: 1,
          name: 'Urban Trailblazers',
          about: "A group for city-dwelling dogs and their owners who love to explore urban landscapes and parks.",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          organizerId: 2,
          name: 'Beachfront Barks',
          about: "Perfect for dogs who can’t stay away from the water. Meetups include beach games and swimming sessions.",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          organizerId: 3,
          name: 'Big Pup',
          about: "Help your pony-sized lapdog socialize and make friends with other pups they won't accidentally flatten",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      options
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Groups';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Urban Trailblazers', 'Beachfront Barks', 'Big Pup'] },
    });
  },
};
