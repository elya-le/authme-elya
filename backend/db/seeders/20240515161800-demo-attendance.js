'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'Attendances', schema: options.schema }, 
      [
        {
          id: 1,  
          eventId: 1,
          userId: 1,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          eventId: 1,
          userId: 2,
          status: 'attending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          eventId: 2,
          userId: 2,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      { validate: true } 
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'Attendances', schema: options.schema }, 
      {
        status: {
          [Sequelize.Op.in]: ['pending', 'attending', 'pending'],
        },
      }
    );
  },
};
