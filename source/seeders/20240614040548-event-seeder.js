'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Events', [
      {
        event_id: 'E001',
        organizer_id: 'UID003',
        event_name: 'Beach Party',
        category: 'Party',
        location: 'Bali',
        event_time: new Date('2024-07-05 18:00:00'),
        description: 'Join us for a fun beach party!',
        photo: 'beach_party.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Events', null, {});
  }
};
