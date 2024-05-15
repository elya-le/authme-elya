'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Attendances',
      [
        {
          id: 1,  
          eventId: 1,
          userId: 1,
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          eventId: 1,
          userId: 2,
          status: 'canceled',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          eventId: 2,
          userId: 2,
          status: 'confirmed',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ],
      options
    );
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Attendances';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3] },
    });
  },
};
