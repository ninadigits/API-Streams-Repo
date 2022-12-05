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
    queryInterface.addColumn('LogAttributeStreams', // table name
      'entry_year', // new field name
      {
        type: Sequelize.INTEGER(10),
        defaultValue: 2022,
        allowNull: false,
      }
    );

    queryInterface.addColumn('DeviceCountEvents', // table name
      'entry_year', // new field name
      {
        type: Sequelize.INTEGER(10),
        defaultValue: 2022,
        allowNull: false,
      }
    );

    queryInterface.addColumn('LogAttributeStreams', // table name
      'entry_month', // new field name
      {
        type: Sequelize.INTEGER(4),
        defaultValue: 11,
        allowNull: false,
      }
    );

    queryInterface.addColumn('DeviceCountEvents', // table name
      'entry_month', // new field name
      {
        type: Sequelize.INTEGER(4),
        defaultValue: 11,
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
    await queryInterface.removeColumn('LogAttributeStreams', 'entry_year');
    await queryInterface.removeColumn('DeviceCountEvents', 'entry_year');
    await queryInterface.removeColumn('LogAttributeStreams', 'entry_month');
    await queryInterface.removeColumn('DeviceCountEvents', 'entry_month');
  }
};
