'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /*
      1.0 Create Table moengages
      2.0 Create Table events
      3.0 Create Table event_attributes
      4.0 Create Table user_attributes
      5.0 Create Table device_attributes
      6.0 Create Table event_attributes
    */

    // -------------------------------------
    // 1.0 Create Table Moengages
    // -------------------------------------
    await queryInterface.createTable('moengages', {
      id: {
        type: Sequelize.INTEGER(100),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      app_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      source: {
        type: Sequelize.STRING(255),
      },
      moe_req_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    // -------------------------------------
    // 2.0 Create Table events
    // -------------------------------------
    await queryInterface.createTable('events', {
      event_uuid: {
        type: Sequelize.INTEGER(100),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      moe_req_id: {
        type: Sequelize.STRING(30),
        refereces: {
          model: {
            tableName: 'moengages',
            model: 'moengage',
            schema: 'schema'
          },
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      event_code: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      event_name: {
        type: Sequelize.STRING(100),
        defaultValue: 'Event Name Empty',
        allowNull: false,
      },
      event_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'Event Type Empty',
        allowNull: false,
      },
      event_source: {
        type: Sequelize.STRING(255),
        defaultValue: 'Event Source Empty',
        allowNull: false,
      },
      push_id: {
        type: Sequelize.STRING(255),
        // allowNull: false,
      },
      uid: {
        type: Sequelize.STRING(100),
        // allowNull: false,
      },
      campaign_id: {
        type: Sequelize.STRING(30),
        // allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    });

    // -------------------------------------
    // 3.0 Create Table event_attributes
    // -------------------------------------
    await queryInterface.createTable('EventAttributes', { 
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      campaign_id: {
        type: Sequelize.STRING(30),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'campaign_id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      event_uuid: {
        type: Sequelize.INTEGER(100),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'event_uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      campaign_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      campaign_type: {
        type: Sequelize.STRING(30),
      },
      campaign_channel: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    // ---------------------------------
    // 4.0 user attributes
    // ---------------------------------
    await queryInterface.createTable('UserAttributes', { 
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      uid: {
        type: Sequelize.STRING(30),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'uid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      event_uuid: {
        type: Sequelize.INTEGER(100),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'event_uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(100),
      },
      email: {
        type: Sequelize.STRING(100),
      },
      phone: {
        type: Sequelize.STRING(15),
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    // ---------------------------------
    // 5.0 device attributes
    // ---------------------------------
    await queryInterface.createTable('DeviceAttributes', { 
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      push_id: {
        type: Sequelize.STRING(30),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'push_id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      event_uuid: {
        type: Sequelize.INTEGER(100),
        refereces: {
          // model: 'events',
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'event_uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      device_id: {
        type: Sequelize.STRING,
        defaultValue: 'Device ID Empty',
      },
      device_name: {
        type: Sequelize.STRING,
        defaultValue: 'Device Name Empty',
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    // ---------------------------------
    // 6.0 Create Table event_attributes
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
        refereces: {
          model: {
            tableName: 'moengages',
            model: 'Moengage',
            schema: 'schema'
          },
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      event_uuid: {
        type: Sequelize.INTEGER(100),
        refereces: {
          model: {
            tableName: 'events',
            model: 'events',
            schema: 'schema'
          },
          key: 'event_uuid',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      attribute_type: {
        type: Sequelize.STRING(100),
        defaultValue: 'Attribute Type Empty',
        allowNull: false,
      },
      attribite_key: {
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
  },
  async down(queryInterface, Sequelize) {
    // await queryInterface.removeConstraint('events', 'moe_req_id');
    await queryInterface.dropTable('moengages');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('EventAttributes');
    await queryInterface.dropTable('UserAttributes');
    await queryInterface.dropTable('DeviceAttributes');
    await queryInterface.dropTable('LogAttributeStreams');
    // await queryInterface.dropAllTables();
  }
};