'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TravelerProfiles', [
      {
        profile_id: 'TP001',
        user_id: 'UID001',
        destination: 'Bali',
        travel_time: new Date('2024-07-01 00:00:00'),
        interests: 'Beaches, Culture',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TravelerProfiles', null, {});
  }
};
