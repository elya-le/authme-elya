'use strict';

const { Model, DataTypes } = require('sequelize'); // import necessary modules from sequelize

module.exports = (sequelize) => { // export a function that defines this model
    class Venue extends Model { // define the venue class which extends Sequelize Model
        static associate(models) { 
            Venue.belongsTo(models.Group, {
                foreignKey: 'groupId', // fk in Venue that connects to Group
                as: 'Group', // alias for this relationship used in includes
                onDelete: 'CASCADE', // delete Venue if the associated Group is deleted
                onUpdate: 'CASCADE' // update the foreign key if the primary key of the Group changes
            });
        }
    }
    Venue.init(
        { // define attributes of the Venue model
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
                  model: 'Groups',  // reference to the Groups table
                  key: 'id'         // key in Groups that groupId refers to
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
                  len: [2, 2],     // ensure the state is exactly 2 characters
                  isUppercase: true // ensure the state is in uppercase letters
                }
            },
            lat: {
                type: DataTypes.FLOAT,
                allowNull: false,
                validate: {
                isFloat: true   // ensure it is a float number
                }
            },
            lng: {
                type: DataTypes.FLOAT,
                allowNull: false,
                validate: {
                  isFloat: true   // ensure it is a float number
                }
            }
        },
        {
            sequelize,             // pass the sequelize instance
            modelName: 'Venue',     // name of the model
            tableName: 'Venues',    // table name, if different from model name
            timestamps: false       // do not automatically create createdAt/UpdatedAt timestamp fields
        }
    );
    return Venue;
};