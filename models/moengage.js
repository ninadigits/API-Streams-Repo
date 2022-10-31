'use strict';
const {
  Model
} = require('sequelize');
var Events = require('./events');
module.exports = (sequelize, DataTypes) => {
  class Moengage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const Event = sequelize.define('events', { moe_req_id: DataTypes.STRING(30) }, { timestamps: false });
      Moengage.hasOne(Event, {
        foreignKey: {
          name: 'moeID'
        }
      });
      Event.belongsTo(Moengage);
      Moengage.hasMany(Event);
    }
  }
  Moengage.init({
    app_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(255),
    },
    moe_req_id: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    timestamps: false,
    sequelize,
    modelName: 'Moengage',
  });
  return Moengage;
};