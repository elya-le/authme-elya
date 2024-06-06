'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // set schema in production
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'Groups', schema: options.schema },
      [
        {
          organizerId: 1, 
          name: 'Urban Trailblazers',
          about: "A group for city-dwelling dogs and their owners who love to explore urban landscapes and parks.",
          type: 'In person',
          private: false,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          organizerId: 2, 
          name: 'Beachfront Barks',
          about: "Perfect for dogs who cant stay away from the water. Meetups include beach games and swimming sessions.",
          type: 'In person',
          private: false,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
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
        {
          organizerId: 1,
          name: 'Sassy Shiba',
          about: "Is your Shiba Inu a little Napoleon? Perfect! Our group loves those with a 'short' temper but a big heart",
          type: 'In person',
          private: true,
          city: 'Brooklyn',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      options
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'Groups', schema: options.schema },
      {
        name: {
          [Sequelize.Op.in]: [
            'Urban Trailblazers', 
            'Beachfront Barks', 
            'Big Pup', 
            'Shih Sass Tzu'
          ],
        },
      }
    );
  },
};
