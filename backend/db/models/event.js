'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.Group, {  
        foreignKey: 'groupId', 
        as: 'Group', 
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId',
        as: 'Venue',
      });
      Event.hasMany(models.Attendance, { 
        foreignKey: 'eventId',
        as: 'Attendances', }); 
      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId', 
        as: 'EventImages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
    }
  }
  Event.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Venues', 
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups', 
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Online', 'In person'), 
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    previewImage: {
      type: DataTypes.STRING,
      allowNull: true,  
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Event',
    timestamps: true, 
  });
  return Event;
};