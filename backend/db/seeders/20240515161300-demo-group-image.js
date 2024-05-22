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
          url: '/images/g-beach.png',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 2, 
          url: '../images/g-urban.png',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 3, 
          url: '../../images/groups1.png',
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
          [Sequelize.Op.in]: [
            '/images/g-beach.png',
            '../images/g-urban.png',
            '../../images/groups1.png',
          ],
        },
      }
    );
  }
};
