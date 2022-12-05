'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DeviceCountEvents', {
      id: {
        type: Sequelize.INTEGER(200),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      device_name: {
        type: Sequelize.STRING(255)
      },
      device_count: {
        type: Sequelize.INTEGER(200)
      },
      last_update: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DeviceCountEvents');
  }
};