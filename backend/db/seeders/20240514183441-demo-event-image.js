'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('EventImages', 
      [
        {
          id: 1,
          url: 'http://example.com/path/to/event1image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          url: 'http://example.com/path/to/event2image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          url: 'http://example.com/path/to/event3image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'EventImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete( options, {
      id: { [Op.in]: [ 1, 2, 3] },
      }, {} );
  },
};
