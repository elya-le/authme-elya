'use strict';

const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert users into the database
    await queryInterface.bulkInsert('Users', [
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: "Demo",
        lastName: "User",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'test-1@user.io',
        username: 'Test-1',
        hashedPassword: bcrypt.hashSync('password1'),
        firstName: "Test1",
        lastName: "User1",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'test-2@user.io',
        username: 'Test-2',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: "Test2",
        lastName: "User2",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'test-3@user.io',
        username: 'Test-3',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: "Test3",
        lastName: "User3",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], options);
  },

  async down (queryInterface, Sequelize) {
    // Add tableName to options for the bulkDelete operation
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: {
        [Op.in]: ['Demo-lition', 'Test-1', 'Test-2', 'Test-3']
      }
    });
  }
};
