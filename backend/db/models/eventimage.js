'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class EventImage extends Model {
        static associate({ Event }) {
            EventImage.belongsTo(Event, { foreignKey: 'eventId' });
        }
    }
    EventImage.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            eventId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            preview: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "EventImage",
        }
    );
    return EventImage;

};