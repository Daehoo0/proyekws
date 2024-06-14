'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('payments', [
      {
        payment_id: 'P001',
        user_id: 'UID001',
        amount: 100,
        payment_date: new Date(),
        guide_id: 'G001',
        event_id: null
      },
      {
        payment_id: 'P002',
        user_id: 'UID001',
        amount: 50,
        payment_date: new Date(),
        guide_id: null,
        event_id: 'E001'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};
