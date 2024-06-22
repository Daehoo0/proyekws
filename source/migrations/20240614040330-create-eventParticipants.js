'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('EventParticipants', {
      participant_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      event_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Events', // Pastikan sesuai dengan nama tabel events yang digunakan
          key: 'event_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users', // Pastikan sesuai dengan nama tabel users yang digunakan
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('EventParticipants');
  }
};
