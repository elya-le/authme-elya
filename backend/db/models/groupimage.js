'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) =>  {
    class GroupImage extends Model {
        static associate(models) {
            GroupImage.belongsTo(models.Group, { 
                foreignKey: 'groupId', 
                as: 'Group', 
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE' 
            });
        }
    }

    GroupImage.init(
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
            url: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: true 
                }
            },
            preview: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false 
            }
        },
        {
            sequelize, 
            modelName: 'GroupImage', 
            tableName: 'GroupImages', 
            schema: process.env.SCHEMA,
            timestamps: true 
        }
    );
    return GroupImage;
};
