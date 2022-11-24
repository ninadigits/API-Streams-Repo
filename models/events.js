'use strict';
const {
  Model
} = require('sequelize');
// var sequelize = require('sequelize');
const Moengage = require('./moengage');
const LogAttributeStreams = require('./logattributestreams');
// const models = require('./models');
module.exports = (sequelize, DataTypes) => {
  class Events extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Events.belongsToMany(Moengage); 
      Moengage.belongsToMany(models.Events);
    }
  }
  Events.init({
    id: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    moe_id: {
      type: Sequelize.INTEGER(200), 
      references: {
        model: 'moengages',
        tableName: 'Moengages',
        schema: 'schema',
        key: 'id'
      },
      allowNull: false,
      onDelete: 'CASCADE'
    },
    event_type: {
      type: DataTypes.STRING(50),
      defaultValue: 'Event Type Empty'
    },
    event_code: {
      type: DataTypes.STRING(50),
      defaultValue: 'Event Code Empty'
    },
    event_name: {
      type: DataTypes.STRING(50),
      defaultValue: 'Event Name Empty'
    },
    event_time: {
      type: DataTypes.DATE,
    },
    event_source: {
      type: DataTypes.STRING(255),
      defaultValue: 'Event Source Empty',
      allowNull: false,
    },
    event_uuid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    event_time: {
      type: DataTypes.INTEGER(100)
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
  }, {
    timestamps: false,
    sequelize,
    modelName: 'Events',
    tableName: "events",
  });

  return Events;
};