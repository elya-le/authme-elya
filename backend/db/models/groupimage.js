'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class GroupImage extends Model {
        static associate({ Group }) {
            GroupImage.belongsTo(Group, { foreignKey: 'groupId' });
        }
    }
    GroupImage.init(
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            groupId: {
                allowNull: false,
                type: DataTypes.INTEGER,
            },
            url: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            preview: {
                allowNull: false,
                type: DataTypes.BOOLEAN,
            },
        },
        {
            sequelize,
            modelName: "GroupImage",
        }
    );
    return GroupImage;
};