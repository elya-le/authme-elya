'use strict';

// import nessary modules from seqelize
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Event extends Model {
        static associate({ EventImage, Group, Venue, Attendance }) {
            Event.hasMany(EventImage, { foreignKey: 'eventId' }); // one-to-many relationship
            Event.belongsTo(Group, { foreignKey: 'groupId' }); // many-to-one relationship
            Event.belongsTo(Venue, { foreignKey: 'venueId' }); // many-to-one relationship
            Event.hasMany(Attendance, { foreignKey: 'eventId' }); // one-to-many relationship
        }
    }
    Event.init(
        {
            id: { // auto increment unique identifier for each record
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            venueId: { // foreign key connects to the venue table
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            groupId: { // foreign key connects to the group table
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            name: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            description: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            type: {
                allowNull: false,
                type: DataTypes.STRING, // ENUM("value", "otherValue"),,
            },
            capacity: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            price: {
                // allowNull: false  // can be nullable if the event is free.
                type: DataTypes.DECIMAL(6, 2),
            },
            startDate: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            endDate: {
                allowNull: false,
                type: DataTypes.DATE,
            },
        },
        {
            sequelize, // linking model to sequelize instance
            modelName: "Event", // naming model within db
        }
    );
    return Event;

};