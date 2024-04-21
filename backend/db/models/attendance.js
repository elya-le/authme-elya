'use strict';

// import nessary modules from seqelize
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Attendance extends Model {
        static associate({ Event, User }) {
            // linking to Event table
            Attendance.belongsTo(Event, { foreignKey: 'eventId' });
            // linking to User table
            Attendance.belongsTo(User, { foreignKey: 'userId' });
        }
    }
    Attendance.init(
        {
            id: { // auto increment unique identifier for each record
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            eventId: { // reference to the event 
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            userId: { // reference to the user attending
                allowNull: false,
                type: DataTypes.INTEGER,
                unique: true,
            },
            status: { // status such as 'attending', 'interested'
                allowNull: false,
                type: DataTypes.STRING, // ENUM("value", "otherValue"),
            },
        },
        { // linking model to sequelize instance
            sequelize,
            modelName: "Attendance", // naming model within db
        }
    );
    return Attendance; // returning class, defined and ready for use
};