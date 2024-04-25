'use strict';

const { User } = require("../models");
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
          name: 'Low Rider Limbo',
          about: "How low can they go? Find out with a limbo contest agility course tailored for those close to the ground.",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 20,
          previewImage: 'image url',
        },
        {
          organizerId: 1,
          name: '2nd Annual Brush your Chow at the Park day',
          about: "Welcome the warmer weather with a fluff-fest -Join us to get ahead of the shedding season and keep those fur clouds under control! ",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 30,
          previewImage: 'image url',
        },
        {
          organizerId: 1,
          name: 'Big Pup Socialization Group',
          about: "Help your pony-sized lapdog make friends with other pups they won't accidentally flatten",
          type: 'In person',
          private: true,
          city: 'New York',
          state: 'NY',
          createdAt: new Date(),
          updatedAt: new Date(),
          numMembers: 40,
          previewImage: 'image url',
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
