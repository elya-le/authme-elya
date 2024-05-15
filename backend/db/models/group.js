'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Group extends Model {
        static associate(models) {
            Group.belongsTo(models.User, {
                foreignKey: "organizerId",
                as: "Organizer",
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE' 
            });
            Group.hasMany(models.GroupImage, {
                foreignKey: "groupId",
                as: "GroupImages",
                onDelete: 'CASCADE', 
                onUpdate: 'CASCADE' 
            });
            Group.hasMany(models.Venue, {
                foreignKey: "groupId",
                as: "Venues",
                onDelete: 'CASCADE', 
                onUpdate: 'CASCADE' 
            });
            Group.belongsToMany(models.User, {
                through: models.Membership,
                foreignKey: "groupId",
                otherKey: "userId",
                as: "Members",
                onDelete: 'CASCADE', 
                onUpdate: 'CASCADE' 
            });
            Group.hasMany(models.Event, {
                foreignKey: "groupId",
                as: "Events",
                onDelete: 'CASCADE', 
                onUpdate: 'CASCADE' 
            });
            Group.hasMany(models.Membership, {
                foreignKey: "groupId",
                as: "Memberships",
                onDelete: 'CASCADE', 
                onUpdate: 'CASCADE' 
            });
    }
};
    Group.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            organizerId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { 
                    model: 'Users',
                    key: 'id',
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, 
                }
            },
            about: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true, 
                    len: [10, 2000], 
                }
            },
            type: {
                type: DataTypes.ENUM('Online', 'In person'),
                allowNull: false,
                validate: {
                    isIn: [['Online', 'In person']], 
                }
            },
            private: {
                type: DataTypes.BOOLEAN,
                defaultValue: false, 
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, 
                }
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, 
                    len: [2, 2], 
                    isUppercase: true, 
                }
            },
            numMembers: {
                type: DataTypes.INTEGER,
                defaultValue: 0,  
                allowNull: false
            },
            previewImage: {
                type: DataTypes.STRING,
                allowNull: true  
            }
        }, {
            sequelize,
            modelName: 'Group',
        }
    );
    return Group;
};