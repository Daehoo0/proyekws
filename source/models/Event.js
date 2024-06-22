const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');

const Event = db.define('Event', {
  event_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  organizer_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  event_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  event_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  photo: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

module.exports = Event;
