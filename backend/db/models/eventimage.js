'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EventImage.belongsTo(models.EventImage, { 
        foreignKey: 'eventId', 
        as: 'Event',           
        onDelete: 'CASCADE',  
        onUpdate: 'CASCADE'   
    });
    }
  }
  EventImage.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Events',
            key: 'id',
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    preview: {
        type: DataTypes.BOOLEAN
    },
    // createdAt and updatedAt can be automatically added by enabling timestamps
  }, {
    sequelize,
    modelName: 'EventImage',
    tableName: 'EventImages',
    timestamps: true, // enable timestamp fields (createdAt and updatedAt)
});

return EventImage;
};