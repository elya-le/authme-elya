'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            // define associations here
            User.hasMany(models.Group, { foreignKey: 'organizerId' });
            User.hasMany(models.Membership, { foreignKey: 'userId' });
            User.hasMany(models.Attendance, { foreignKey: 'userId' });
        }
    }

    // initialize model
    User.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'username',
            validate: {
                len: [4, 30],
                isNotEmail(value) {
                if (value.includes('@')) {
                    throw new Error('Username cannot be an email.');
                    }
                },
        },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: 'email',
            validate: {
                isEmail: { msg: 'Must be a valid email address.' },
            },
        },
        hashedPassword: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
            len: [60, 60],
            },
        },
    }, {
        sequelize,
        modelName: 'User',
        defaultScope: {
            attributes: { exclude: ['hashedPassword', 'createdAt', 'updatedAt'] },
        },
    });

    return User;
};
