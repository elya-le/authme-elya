'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'GroupImages', schema: options.schema },
      [
        {
          groupId: 1,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 2, 
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 3, 
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 4, 
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      { ...options, validate: true }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'GroupImages', schema: options.schema },
      null,
      {}
    );
  },
};
