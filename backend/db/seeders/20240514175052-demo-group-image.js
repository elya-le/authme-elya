'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('GroupImages', 
      [
        {
          groupId: 1,
          url: 'http://example.com/path/to/group1image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          groupId: 2,
          url: 'http://example.com/path/to/group2image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          groupId: 3,
          url: 'http://example.com/path/to/group3image.jpg',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'GroupImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete( options, {
      groupId: { [Op.in]: [ 1, 2, 3] },
      }, {} );
  },
};
