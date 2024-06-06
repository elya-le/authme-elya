'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    static associate(models) {
      Venue.belongsTo(models.Group, {
        foreignKey: 'groupId', 
        as: 'Group', 
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE' 
      });
    }
  }
  Venue.init(
    { 
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Groups',  
          key: 'id'         
        }
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [2, 2],    
          isUppercase: true 
        }
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isFloat: {
            msg: 'Latitude must be a float'
          },
          min: {
            args: -90,
            msg: 'Latitude must be between -90 and 90'
          },
          max: {
            args: 90,
            msg: 'Latitude must be between -90 and 90'
          }
        }
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isFloat: {
            msg: 'Longitude must be a float'
          },
          min: {
            args: -180,
            msg: 'Longitude must be between -180 and 180'
          },
          max: {
            args: 180,
            msg: 'Longitude must be between -180 and 180'
          }
        }
      }
    }, {
      sequelize,
      modelName: 'Venue',
    });
  return Venue;
};
