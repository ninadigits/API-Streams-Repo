'use strict';
const {
  Model
} = require('sequelize');
var Events = require('../models/events');
var EventAttributes = require('./eventattributes');
module.exports = (sequelize, DataTypes) => {
  class LogAttributeStreams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // LogAttributeStreams.hasOne(models.Events.event_uuid);
      // LogAttributeStreams.hasOne(models.EventAttributes.id);
    }
  }
  LogAttributeStreams.init({
    id: {
      type: DataTypes.INTEGER(200),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    moe_id: {
      type: DataTypes.INTEGER(100),
      refereces: {
        model: {
          tableName: 'moengages',
          model: 'Moengage',
          schema: 'schema'
        },
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    event_uuid: {
      type: DataTypes.INTEGER(100),
      refereces: {
        model: {
          tableName: 'events',
          schema: 'schema'
        },
        key: 'event_uuid',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    attribute_type: {
      type: DataTypes.STRING(100),
      defaultValue: 'Attribute Type Empty',
      allowNull: false,
    },
    attribite_key: {
      type: DataTypes.STRING(100),
      defaultValue: 'Attribute Name Empty',
      allowNull: false,
    },
    attribute_value: {
      type: DataTypes.TEXT,
      defaultValue: 'Attribute Value Empty',
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: false,
    sequelize,
    modelName: 'LogAttributeStreams',
  });
  return LogAttributeStreams;
};