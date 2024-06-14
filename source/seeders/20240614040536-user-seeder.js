'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        user_id: 'UID001',
        username: 'traveler1',
        password: '$2b$10$hashpassword',
        email: 'traveler1@example.com',
        role: 'traveler',
        balance: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 'UID002',
        username: 'guide1',
        password: '$2b$10$hashpassword',
        email: 'guide1@example.com',
        role: 'guide',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        user_id: 'UID003',
        username: 'organizer1',
        password: '$2b$10$hashpassword',
        email: 'organizer1@example.com',
        role: 'organizer',
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
