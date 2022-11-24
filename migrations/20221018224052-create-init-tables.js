'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /*
      1.0 Create Table moengages
      2.0 Create Table events
      3.0 Create Table event_attributes
    */

    // -------------------------------------
    // 1.0 Create Table Moengages
    // -------------------------------------
    await queryInterface.createTable('Moengages', {
      id: {
        type: Sequelize.INTEGER(200),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      app_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      export_doc_id: {
        type: Sequelize.STRING(50)
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // -------------------------------------
    // 2.0 Create Table events
    // -------------------------------------
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.STRING(100),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      moe_id: {
        type: Sequelize.INTEGER(200),
        allowNull: false
      },
      uid: {
        type: Sequelize.STRING(50),
        // defaultValue: 'Null'
      },
      event_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'Event Type Empty'
      },
      event_code: {
        type: Sequelize.STRING(50),
        defaultValue: 'Event Code Empty'
      },
      event_name: {
        type: Sequelize.STRING(50),
        defaultValue: 'Event Name Empty'
      },
      event_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      event_source: {
        type: Sequelize.STRING(255),
        defaultValue: 'Event Source Empty',
        allowNull: false,
      },
      event_uuid: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      event_time: {
        type: Sequelize.INTEGER(100)
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    });

    queryInterface.addConstraint('Events', {
      fields: ['moe_id'],
      type: 'foreign key',
      name: 'fk_moe_for_event',
      references: { //Required field
        table: 'Moengages',
        model: 'moengage',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });

    // ---------------------------------
    // 3.0 Create Table event_attributes
    // ---------------------------------
    await queryInterface.createTable('LogAttributeStreams', { 
      id: {
        type: Sequelize.INTEGER(200),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      moe_id: {
        type: Sequelize.INTEGER(100),
        allowNull: false
      },
      event_id: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      attribute_type: {
        type: Sequelize.STRING(100),
        defaultValue: 'Attribute Type Empty',
        allowNull: false
      },
      attribute_key: {
        type: Sequelize.STRING(100),
        defaultValue: 'Attribute Name Empty',
        allowNull: false,
      },
      attribute_value: {
        type: Sequelize.TEXT,
        defaultValue: 'Attribute Value Empty',
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    queryInterface.addConstraint('LogAttributeStreams', {
      fields: ['moe_id'],
      type: 'foreign key',
      name: 'fk_moe_for_log',
      references: { //Required field
        table: 'Moengages',
        model: 'moengage',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
    
    queryInterface.addConstraint('LogAttributeStreams', {
      fields: ['event_id'],
      type: 'foreign key',
      name: 'fk_event_for_log',
      references: { //Required field
        table: 'Events',
        model: 'events',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Events', 'fk_moe_for_event');
    await queryInterface.removeConstraint('LogAttributeStreams', 'fk_moe_for_log');
    await queryInterface.removeConstraint('LogAttributeStreams', 'fk_event_for_log');
    await queryInterface.dropTable('Moengages');
    await queryInterface.dropTable('Events');
    await queryInterface.dropTable('LogAttributeStreams');
  }
};