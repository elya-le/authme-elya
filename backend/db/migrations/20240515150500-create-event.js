'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; 
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      venueId: {
        type: Sequelize.INTEGER,
        references: { model: 'Venues', key: 'id' }, 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      groupId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Groups', key: 'id' }, 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      capacity: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.DECIMAL(6, 2),
      },
      startDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      endDate: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      previewImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    }, options); 
  },
  async down(queryInterface, Sequelize) {
    options.tableName = 'Events';
    return queryInterface.dropTable(options); 
  },
};