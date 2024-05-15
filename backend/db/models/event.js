'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    static associate(models) {
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId',
        as: 'Venue',
      });
      Event.belongsTo(models.Group, {  // event belongs to a Group
        foreignKey: 'groupId', // ensure foreignKey is set according to the schema
        as: 'Group', // using 'Group' as an alias for the association
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId', // match foreign key with column name in EventImages table
        as: 'EventImages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'  // using 'EventImages' as an alias for the association
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
        model: 'Venues', // this should match the table name of the model it references
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups', // this should match the table name of the model it references
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
      type: DataTypes.ENUM('Online', 'In person'), // specifying the enum options as per your schema
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true // assuming capacity might be nullable based on event type
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true // assuming price might be nullable or free events
    },
    previewImage: {
      type: DataTypes.STRING,
      allowNull: true,  // or false, based on your schema requirements
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
    timestamps: true, // assuming we want Sequelize to automatically manage createdAt and updatedAt
  });
  return Event;
};