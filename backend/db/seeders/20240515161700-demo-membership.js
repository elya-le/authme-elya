'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      { tableName: 'Memberships', schema: options.schema }, 
      [
        {
          id: 1,  
          userId: 1,
          groupId: 1,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 2,
          groupId: 1,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userId: 1,
          groupId: 2,
          status: 'inactive',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      { validate: true } 
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: 'Memberships', schema: options.schema }, 
      {
        status: {
          [Sequelize.Op.in]: ['active', 'inactive', 'pending'],
        },
      }
    );
  },
};
