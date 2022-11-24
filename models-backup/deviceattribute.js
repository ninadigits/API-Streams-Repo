'use strict';
const {
  Model
} = require('sequelize');
// var sequelize = require('sequelize');
var Events = require('../models/events');
module.exports = (sequelize, DataTypes) => {
  class DeviceAttribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceAttribute.init({
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      // autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    push_id: {
      type: DataTypes.STRING(30),
      refereces: {
        model: {
          tableName: 'events',
          schema: 'schema'
        },
        key: 'push_id',
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
    device_id: {
      type: DataTypes.STRING,
      defaultValue: 'Device ID Empty',
    },
    device_name: {
      type: DataTypes.STRING,
      defaultValue: 'Device Name Empty',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: false,
    sequelize,
    modelName: 'DeviceAttribute',
  });
  return DeviceAttribute;
};