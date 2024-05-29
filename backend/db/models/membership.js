'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    static associate(models) { 
      Membership.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'User',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
      Membership.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'Group',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE' 
      });
    }
  }
  Membership.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id',
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups', 
        key: 'id',
      }
    },
    status: {
      type: DataTypes.ENUM,
      values: ['pending', 'member', 'co-host', 'inactive'],
      allowNull: false
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
    modelName: 'Membership',
  });
  return Membership;
};
