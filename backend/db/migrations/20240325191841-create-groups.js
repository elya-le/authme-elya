"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Groups",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        organizerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: {
              tableName: "Users",
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        about: {
          allowNull: false,
          type: Sequelize.TEXT,
        },
        type: {
          type: Sequelize.ENUM('Online', 'In person'),
          allowNull: false,
        },
        private: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        city: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        state: {
          allowNull: false,
          type: Sequelize.STRING(2),
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
        numMembers: {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0, // set a default value or remove if not needed
        },
        previewImage: {
          allowNull: true, // set to false if this should be a required field
          type: Sequelize.STRING,
        },

      },
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Groups";
    return queryInterface.dropTable(options);
  },
};
