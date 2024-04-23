'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(
      'Users',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        firstName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        lastName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        username: {
          allowNull: false,
          type: Sequelize.STRING(30),
          unique: true,
        },
        hashedPassword: {
          allowNull: false,
          type: Sequelize.STRING.BINARY,
        },
        email: {
          allowNull: false,
          type: Sequelize.STRING(256),
          unique: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      options
    );
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users'; // set table name for the operation
    return queryInterface.dropTable(options); // drop the 'Users' table from the database
  }
};
