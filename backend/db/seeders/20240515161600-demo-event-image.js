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
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 2,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 3,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 4,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 5,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 6,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 7,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 8,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 9,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 10,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 11,
          url: '/images/img.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 12,
          url: '/images/img.png', 
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
          [Sequelize.Op.in]: [
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png',
            '/images/img.png'
          ]
        }
      }
    );
  }
};
