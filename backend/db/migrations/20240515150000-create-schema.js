'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      await queryInterface.createSchema(options.schema); 
    }
  },
  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      await queryInterface.dropSchema(options.schema); 
    }
  }
};