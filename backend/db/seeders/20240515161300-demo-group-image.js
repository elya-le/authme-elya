'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    console.log('Running GroupImages seeder'); 
    await queryInterface.bulkInsert(
      { tableName: 'GroupImages', schema: options.schema },
      [
        {
          groupId: 1,
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/g-1.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 2, 
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/g-2.png', 
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 3, 
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/g-3.png',
          preview: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          groupId: 4, 
          url: 'https://portfolio-elya.s3.us-east-2.amazonaws.com/seeders/g-4.png', 
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

