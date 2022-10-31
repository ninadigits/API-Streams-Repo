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
    
    /**
     * 1.0 Table Of Event
     * 2.0 Table Of Event Attributes
     */

    // ----------------------------
    // 1.0 Table Of Event
    // ----------------------------
    await queryInterface.createTable('events', { 
      event_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      moe_req_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        references: { model: 'moengage', key: 'moe_req_id' },
        onDelete: 'CASCADE',
      },
      event_code: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },
      event_time: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      event_time: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      event_source: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      push_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      created_at: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
    });

    // ----------------------------
    // 2.0 Table Of Event Attributes
    // ----------------------------
    await queryInterface.createTable('event_attributes', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      campaign_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        references: { model: 'events', key: 'campaign_id' },
        onDelete: 'CASCADE',
      },
      event_id: {
        type: Sequelize.STRING(40),
        allowNull: false,
        references: { model: 'events', key: 'event_id' },
        onDelete: 'CASCADE',
      },
      campaign_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      campaign_type: {
        type: Sequelize.STRING(30),
        // allowNull: false,
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
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    // queryInterface.removeConstraint('events', {
    //   fields: ['MoeBelongsEvent'],
    //   type: 'foreign key',
    //   name: 'moengage_have_child_name_is_events',
    //   references: {
    //     table: 'moengage',
    //     field: 'moe_req_id',
    //   }
    // });

    // queryInterface.removeConstraint('event_attributes', {
    //   fields: ['EvBelongsCamp'],
    //   type: 'foreign key',
    //   name: 'event_have_child_name_is_campaign',
    //   references: {
    //     table: 'events',
    //     field: 'campaign_id',
    //   }
    // });
    
    // queryInterface.removeConstraint('event_attributes', {
    //   fields: ['EvIDBelongsCamp'],
    //   type: 'foreign key',
    //   name: 'event_have_child_name_is_event_attributes',
    //   references: {
    //     table: 'events',
    //     field: 'event_id',
    //   }
    // });

    await queryInterface.dropTable('events');
    await queryInterface.dropTable('event_attributes');
  }
};
