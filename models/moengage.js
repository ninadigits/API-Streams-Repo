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
      // models.Moengage.belongsToMany(models.Events); 
      // models.Events.belongsToMany(models.Moengage);
    }
  }
  Moengage.init({
    app_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    export_doc_id: {
      type: DataTypes.STRING(50)
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
    tableName: 'Moengage'
  });

  return Moengage;
};