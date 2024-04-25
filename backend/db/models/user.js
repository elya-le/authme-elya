'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }
  };

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
      // excludes from sending this infomation to user
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'firstName', 'lastName', 'email', "createdAt", "updatedAt"],
        },
      },
    }
  );
  return User;
};