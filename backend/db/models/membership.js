'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Membership extends Model {
        static associate(models) { // define associations 
            Membership.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'User'
            });
            Membership.belongsTo(models.Group, {
                foreignKey: 'groupId',
                as: 'Group'
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
            type: DataTypes.ENUM('active', 'inactive', 'pending'), 
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
        modelName: 'Membership',
    });

    return Membership;
};