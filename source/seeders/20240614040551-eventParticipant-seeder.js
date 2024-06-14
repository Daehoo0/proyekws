'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('event_participants', [
      {
        participant_id: 'EP001',
        event_id: 'E001',
        user_id: 'UID001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('event_participants', null, {});
  }
};
