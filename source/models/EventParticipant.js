const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const Event = require('./Event');
const User = require('./User');

const EventParticipant = db.define('EventParticipant', {
  participant_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Event,
      key: 'event_id',
    },
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

module.exports = EventParticipant;
