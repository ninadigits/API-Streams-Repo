'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    queryInterface.addColumn('DeviceCountEvents', // table name
      'entry_year', // new field name
      {
        type: Sequelize.INTEGER(10),
        allowNull: false,
      }
    );

    queryInterface.addColumn('DeviceCountEvents', // table name
      'entry_month', // new field name
      {
        type: Sequelize.INTEGER(4),
        allowNull: false,
      }
    );
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('DeviceCountEvents', 'entry_year');
    await queryInterface.removeColumn('DeviceCountEvents', 'entry_month');
  }
};
