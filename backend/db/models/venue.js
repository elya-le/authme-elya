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
                allowNull: false,
                validate: {
                isFloat: true  
                }
            },
            lng: {
                type: DataTypes.FLOAT,
                allowNull: false,
                validate: {
                    isFloat: true  
                }
            }
        }, {
            sequelize,
            modelName: 'Venue',
        });
    return Venue;
};