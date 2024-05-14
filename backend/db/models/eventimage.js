'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
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
  }, {
    sequelize,
    modelName: 'EventImage',
    tableName: 'EventImages',
    timestamps: true, // enable timestamp fields (createdAt and updatedAt)
});

return EventImage;
};