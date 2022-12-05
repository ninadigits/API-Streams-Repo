'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeviceCountEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DeviceCountEvent.init({
    device_name: {
      type: DataTypes.STRING(255)
    },
    device_count: {
      type: DataTypes.INTEGER(200)
    },
    entry_year: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
    },
    entry_month: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
    },
    last_update: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: false,
    sequelize,
    modelName: 'DeviceCountEvent',
    tableName: 'devicecountevents'
  });
  return DeviceCountEvent;
};