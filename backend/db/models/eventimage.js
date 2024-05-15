'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EventImage extends Model {
    static associate(models) {
      EventImage.belongsTo(models.Event, { 
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
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    preview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    }, {
      sequelize,
      modelName: 'EventImage',
      tableName: 'EventImages',
      timestamps: true, 
  });
return EventImage;
};