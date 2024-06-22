const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const Event = require('./Event');

const Cart = db.define('Cart', {
  cart_id: {
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
  event_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Event,
      key: 'event_id',
    },
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
});

module.exports = Cart;
