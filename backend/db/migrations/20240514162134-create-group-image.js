'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GroupImages', 
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups', // references the Groups table
          key: 'id'
        },
        onDelete: 'CASCADE', // add onDelete cascade
        onUpdate: 'CASCADE' // add onUpdate cascade
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isUrl: true // ensure the url is a valid URL
        }
      },
      preview: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false // default value for preview is false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GroupImages');
  }
};
