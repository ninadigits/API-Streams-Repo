'use strict';
const {
  Model
} = require('sequelize');
var Events = require('./events');
var LogAttributeStreams = require('./logattributestreams');
module.exports = (sequelize, DataTypes) => {
  class EventAttribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //  
    }
  }
  EventAttribute.init({
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      // autoIncrement: true,
      allowNull: false,
      unique: true,
    },
    campaign_id: {
      type: DataTypes.STRING(30),
      refereces: {
        model: {
          tableName: 'events',
          schema: 'schema'
        },
        key: 'campaign_id',
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
    campaign_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    campaign_type: {
      type: DataTypes.STRING(30),
    },
    campaign_channel: {
      type: DataTypes.STRING(50),
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
    modelName: 'EventAttribute',
  });
  return EventAttribute;
};