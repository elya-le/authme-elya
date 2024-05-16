'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'GroupImages',
      [
        {
          id: 1,  
          groupId: 1,
          url: 'http://example.com/path/to/group1image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          groupId: 2,
          url: 'http://example.com/path/to/group2image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          groupId: 3,
          url: 'http://example.com/path/to/group3image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { ...options, validate: true } 
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'GroupImages', schema: options.schema }, 
      {
        url: {
          [Sequelize.Op.in]: ['http://example.com/path/to/group1image.jpg', 'http://example.com/path/to/group2image.jpg', 'http://example.com/path/to/group3image.jpg'],
        },
      }
    );
  },
};
