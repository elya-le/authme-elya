'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // schema name for production
}
module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      await queryInterface.createSchema(options.schema); // create schema if in production
    }
  },
  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      await queryInterface.dropSchema(options.schema, { ifExists: true }); // drop schema if it exists
    }
  }
};
