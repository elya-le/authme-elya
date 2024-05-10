"use strict";

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Venues', 
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      groupId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Groups",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      state: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      lat: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      lng: {
        allowNull: false,
        type: Sequelize.FLOAT,
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
    },
    options
  );
},
async down(queryInterface, Sequelize) {
  options.tableName = "Venues";
  return queryInterface.dropTable(options);
  },
};