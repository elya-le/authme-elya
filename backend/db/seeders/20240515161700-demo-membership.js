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
          userId: 1,
          groupId: 1,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 2,
          groupId: 1,
          status: 'member',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 1,
          groupId: 2,
          status: 'co-host',
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
          [Sequelize.Op.in]: ['pending', 'member', 'co-host', 'inactive'],
        },
      }
    );
  },
};
