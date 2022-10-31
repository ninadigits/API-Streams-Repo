'use strict';
const {
  Model
} = require('sequelize');
// var sequelize = require('sequelize');
var Moengage = require('./moengage');
var EventAttributes = require('./eventattributes');
var UserAttributes = require('./userattribute');
var LogAttributeStreams = require('./logattributestreams')
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Events.belongsTo(models.Moengage, {
        foreignKey: 'moe_req_id'
      });
    }
  }
  Events.init({
    event_uuid: {
      type: DataTypes.INTEGER(100),
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    moe_req_id: {
      type: DataTypes.STRING(30),
      refereces: {
        model: {
          tableName: 'moengages',
          schema: 'schema'
        },
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    },
    event_code: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    event_name: {
      type: DataTypes.STRING(100),
      defaultValue: 'Event Name Empty',
      allowNull: false,
    },
    event_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'Event Type Empty',
      allowNull: false,
    },
    event_source: {
      type: DataTypes.STRING(255),
      defaultValue: 'Event Source Empty',
      allowNull: false,
    },
    push_id: {
      type: DataTypes.STRING(255),
    },
    uid: {
      type: DataTypes.STRING(100),
    },
    campaign_id: {
      type: DataTypes.STRING(30),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
  }, {
    timestamps: false,
    sequelize,
    modelName: 'Events',
  });
  return Events;
};