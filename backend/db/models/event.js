'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * helper method for defining associations.
     * this method is not a part of Sequelize lifecycle.
     * the `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.belongsTo(models.Venue, {
        foreignKey: 'venueId',
        as: 'Venue'
      });
      Event.belongsTo(models.Group, {  // event belongs to a Group
        foreignKey: 'groupId', // ensure foreignKey is set according to the schema
        as: 'Group' // using 'Group' as an alias for the association
      });
      Event.hasMany(models.EventImage, {
        foreignKey: 'eventId', // match foreign key with column name in EventImages table
        as: 'EventImages' // using 'EventImages' as an alias for the association
      });
      Event.hasMany(models.Attendance, {
        foreignKey: 'eventId',
        as: 'Attendances',
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
        model: 'Venues', // This should match the table name of the model it references
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
    // In models/event.js
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