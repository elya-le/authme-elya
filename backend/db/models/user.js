'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Group, {
        foreignKey: 'organizerId', 
        as: 'Organizer' 
      });
      User.belongsToMany(models.Group, {
        through: models.Membership, 
        foreignKey: 'userId', 
        otherKey: 'groupId', 
        as: 'Member' 
      });
      User.belongsToMany(models.Event, {
        through: models.Attendance, 
        foreignKey: 'userId', 
        otherKey: 'eventId', 
        as: 'Attended' 
      });
    }
  }
  User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        lastName: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            name: "User already exists",
            msg: "User with that username already exists",
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            message: 'User already exists',
            msg: 'User with that email already exists',
          },
          validate: {
            len: [3, 256],
            isEmail: true,
          },
        },
        hashedPassword: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [60, 60],
          },
        },
      },
      {
        sequelize,
        modelName: 'User',
        schema: process.env.SCHEMA
      }
    );
    return User;
};
