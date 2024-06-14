'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Guides', [
      {
        guide_id: 'G001',
        user_id: 'UID002',
        location: 'Bali',
        experience: '5 years experience as a local guide',
        rate: 100,
        photo: 'guide1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Guides', null, {});
  }
};
