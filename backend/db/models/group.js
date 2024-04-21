"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Group extends Model {
        static associate(models) {
            // aasociate with User through OrganizerId
            Group.belongsTo(models.User, { foreignKey: "organizerId" });

            // associate with GroupImage
            Group.hasMany(models.GroupImage, { foreignKey: "groupId" });

            // associate with Venue
            Group.hasMany(models.Venue, { foreignKey: "groupId" });

            // many-to-many association with User through Membership
            Group.belongsToMany(models.User, {
                through: models.Membership,
                foreignKey: "groupId",
                otherKey: "userId",
            });
            // associate with Event
            Group.hasMany(models.Event, { foreignKey: "groupId" });

            // associate with Membership
            Group.hasMany(models.Membership, { foreignKey: "groupId" });
        }
    }
    Group.init({
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        organizerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { len: [1, 60] },
        },
        about: {
            type: DataTypes.TEXT, // assuming long text
            allowNull: false,
            validate: { len: [50, 1000] }, // example range for min and max length
        },
        type: {
            type: DataTypes.STRING, // ENUM values should be specified if using ENUM
            allowNull: false,
        },
        private: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Group",
        }
    );
    return Group;
};
