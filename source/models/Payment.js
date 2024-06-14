const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const Guide = require('./Guide');
const Event = require('./Event');

const Payment = db.define('Payment', {
  payment_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  guide_id: {
    type: DataTypes.STRING,
    references: {
      model: Guide,
      key: 'guide_id',
    },
  },
  event_id: {
    type: DataTypes.STRING,
    references: {
      model: Event,
      key: 'event_id',
    },
  },
});

module.exports = Payment;
