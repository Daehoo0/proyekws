'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('guide_requests', [
      {
        request_id: 'GR001',
        traveler_id: 'UID001',
        guide_id: 'G001',
        request_date: '2024-07-02 00:00:00',
        message: 'Looking for a guide in Bali',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('guide_requests', null, {});
  }
};
