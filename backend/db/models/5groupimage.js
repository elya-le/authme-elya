'use strict';

// import the necessary modules from Sequelize
const { Model, DataTypes } = require('sequelize');

// export a function that defines the model
module.exports = (sequelize) => { // define the GroupImage class which extends Sequelize Model
    class GroupImage extends Model { // set up model associations in a static method
        static associate(models) {
            GroupImage.belongsTo(models.Group, { // define a many-to-one relationship with Group
                foreignKey: 'groupId', // the foreign key in GroupImage that connects to Group
                as: 'Group',           // alias for this relationship, used in includes
                onDelete: 'CASCADE',   // delete GroupImage if the associated Group is deleted
                onUpdate: 'CASCADE'    // update the foreign key if the primary key of Group changes
            });
        }
    }

// initialize the model's attributes and options
GroupImage.init(
    {
        // define attributes of the GroupImage model
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
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: true    // ensure the url is a valid URL
            }
        },
        preview: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false  // default value for preview is false
        }
    },
    {
      sequelize,             // pass the sequelize instance
      modelName: 'GroupImage', // name of the model
      tableName: 'GroupImages', // table name, if different from model name
      timestamps: false         // do not automatically create createdAt/updatedAt timestamp fields
    }
);
return GroupImage;
};
