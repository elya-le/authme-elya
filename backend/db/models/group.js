'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Group extends Model {
        static associate(models) {
        // can define association here
        // i.e. Group.belongsTo(models.User, { foreignKey: 'organizerId', as: 'organizer' });
        Group.belongsTo(models.User, {
            foreignKey: "organizerId",
            as: "Organizer",
        });
        Group.hasMany(models.GroupImage, {
            foreignKey: "groupId",
            as: "GroupImages"
        });
        Group.hasMany(models.Venue, {
            foreignKey: "groupId",
        });
    //   Group.belongsToMany(models.User, {
    //     through: models.Membership,
    //     foreignKey: "groupId",
    //     otherKey: "userId",
    //     as: "Member",
    //   });
    //   Group.hasMany(models.Event, {
    //     foreignKey: "groupId",
    //   });
    //   Group.hasMany(models.Membership, {
    //     foreignKey: "groupId",
    //   });
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
                references: { // user hasMany Groups
                    model: 'Users',
                    key: 'id',
                }
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, // don't allow empty strings
                }
            },
            about: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true, // don't allow empty strings
                    len: [10, 2000], // only allow values with length between 10 and 2000
                }
            },
            type: {
                type: DataTypes.ENUM('Online', 'In person'),
                allowNull: false,
                validate: {
                  isIn: [['Online', 'In person']], // value must be within these options
                }
            },
            private: {
                type: DataTypes.BOOLEAN,
                defaultValue: false, // set default value
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, // don't allow empty strings
                }
            },
            state: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true, // don't allow empty strings
                    len: [2, 2], // assuming state is in two-letter format
                    isUppercase: true, // must be uppercase letters
                }
            },
            numMembers: {
                type: DataTypes.INTEGER,
                defaultValue: 0,  // default number of members when a group is created
                allowNull: false
            },
            previewImage: {
                type: DataTypes.STRING,
                allowNull: true  // preview image is optional
            }
        }, {
            sequelize,
            modelName: 'Group',
        }
    );
    return Group;
};