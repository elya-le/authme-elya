"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    class Venue extends Model {
        static associate({ Group, Event }) {
            Venue.belongsTo(Group, {
        foreignKey: "groupId",
    });
    Venue.belongsToMany(Group, {
        through: Event,
        foreignKey: "venueId",
        otherKey: "groupId",
    });
    }
}
Venue.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false, // if a venue always belongs to a group, this should be not null.
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false, // assuming address should be not null.
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false, // assuming city should be not null.
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false, // assuming state should be not null.
    },
    lat: {
        type: DataTypes.FLOAT,
        allowNull: true, // set to true if latitude can be null, or false if it is required.
    },
    lng: {
        type: DataTypes.FLOAT,
        allowNull: true, // set to true if longitude can be null, or false if it is required.
    },
}, {
    sequelize,
    modelName: "Venue",
    // remove 'defaultScope' if you want to include createdAt and updatedAt by default
    // add scopes here if needed
});

return Venue;
};