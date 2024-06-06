'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    console.log('Running EventImages seeder'); 
    await queryInterface.bulkInsert(
      { tableName: 'EventImages', schema: options.schema },
      [
        {
          eventId: 1,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-1.png', // s3 url for event 1 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 2,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-2.png', // s3 url for event 2 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 3,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-3.png', // s3 url for event 3 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 4,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-4.png', // s3 url for event 4 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 5,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-5.png', // s3 url for event 5 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 6,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-6.png', // s3 url for event 6 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 7,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-7.png', // s3 url for event 7 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 8,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-8.png', // s3 url for event 8 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 9,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-9.png', // s3 url for event 9 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 10,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-10.png', // s3 url for event 10 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 11,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-11.png', // s3 url for event 11 image
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          eventId: 12,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-12.png', // s3 url for event 12 image
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
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-1.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-2.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-3.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-4.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-5.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-6.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-7.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-8.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-9.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-10.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-11.png',
            'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/e-12.png'
          ]
        }
      }
    );
  }
};
