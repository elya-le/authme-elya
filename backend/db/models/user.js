'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Group, {
        foreignKey: 'organizerId', // foreign key in the Group model
        as: 'Organizer' // alias for this association
      });
      User.belongsToMany(models.Group, {
        through: models.Membership, // through the Membership model
        foreignKey: 'userId', // foreign key in the Membership model
        otherKey: 'groupId', // other key in the Membership model
        as: 'Member' // alias for this association
      });
      User.belongsToMany(models.Event, {
        through: models.Attendance, // through the Attendance model
        foreignKey: 'userId', // foreign key in the Attendance model
        otherKey: 'eventId', // other key in the Attendance model
        as: 'Attended' // alias for this association
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
      defaultScope: { 
        attributes: { // excludes from sending this infomation to user
          exclude: ['hashedPassword', 'firstName', 'lastName', 'email', "createdAt", "updatedAt"],
        },
      },
    }
  );
  return User;
};