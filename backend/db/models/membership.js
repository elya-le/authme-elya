'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Membership extends Model {
        static associate({ User, Group }) {
            Membership.belongsTo(User, { foreignKey: 'userId' });
            Membership.belongsTo(Group, { foreignKey: 'groupId' });
        }
    }
    Membership.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            groupId: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            status: {
                allowNull: false,
                type: DataTypes.STRING, // ENUM("value", "otherValue"),,
            },
        },
        {
            sequelize,
            modelName: "Membership",
        }
    );
    return Membership;
};