'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'EventImages', schema: options.schema }, 
      [
        {
          eventId: 1,
          url: 'http://example.com/path/to/event1image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 2,
          url: 'http://example.com/path/to/event2image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 3,
          url: 'http://example.com/path/to/event3image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { validate: true } 
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'EventImages', schema: options.schema }, 
      {
        url: {
          [Sequelize.Op.in]: ['http://example.com/path/to/event1image.jpg', 'http://example.com/path/to/event2image.jpg','http://example.com/path/to/event3image.jpg',],
        },
      }
    );
  },
};
