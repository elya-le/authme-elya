'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
        Attendance.belongsTo(models.Event, {
          foreignKey: 'eventId',
          as: 'Event', 
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE' 
        });
        Attendance.belongsTo(models.User, {
          foreignKey: 'userId',
          as: 'User', 
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE' 
        });
    }
  }

  Attendance.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Events',
          key: 'id',
        }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'waitlist', 'attending', 'canceled'), 
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};