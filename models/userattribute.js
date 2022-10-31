'use strict';
const {
  Model
} = require('sequelize');
var Events = require('../models/events');
module.exports = (sequelize, DataTypes) => {
  class UserAttribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // UserAttribute.hasOne(models.Events.event_uuid, models.Events.uid);
      // UserAttribute.belongsTo(models.Events.event_uuid, models.Events.uid);
    }
  }
  UserAttribute.init({
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      // autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    uid: {
      type: DataTypes.STRING(30),
      refereces: {
        model: {
          tableName: 'events',
          schema: 'schema'
        },
        key: 'uid',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    event_uuid: {
      type: DataTypes.INTEGER(100),
      refereces: {
        // model: 'events',
        model: {
          tableName: 'events',
          schema: 'schema'
        },
        key: 'event_uuid',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(100),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    phone: {
      type: DataTypes.STRING(15),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: false,
    sequelize,
    modelName: 'UserAttribute',
  });
  return UserAttribute;
};