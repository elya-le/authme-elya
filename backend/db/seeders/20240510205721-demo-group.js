'use strict';

const { Group } = require("../models");
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Groups',
      [
        {
          organizerId: 1,
          name: 'Urban Trailblazers',
          about: "A group for city-dwelling dogs and their owners who love to explore urban landscapes and parks.",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 20,
          previewImage: 'http://example.com/path/to/urban-trailblazers.jpg',
        },
        {
          organizerId: 2,
          name: 'Beachfront Barks',
          about: "Perfect for dogs who can’t stay away from the water. Meetups include beach games and swimming sessions.",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 30,
          previewImage: 'http://example.com/path/to/beachfront-barks.jpg',
        },
        {
          organizerId: 3,
          name: 'Big Pup Mixer',
          about: "Help your pony-sized lapdog socialize and make friends with other pups they won't accidentally flatten",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 40,
          previewImage: 'http://example.com/path/to/big-pup.jpg',
        },
      ],
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Groups";
    return queryInterface.bulkDelete(options);
  },
};
