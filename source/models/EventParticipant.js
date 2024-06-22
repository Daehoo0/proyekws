// models/eventParticipant.js
const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const Event = require('./Event');
const User = require('./User');

const EventParticipant = db.define('EventParticipant', {
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = EventParticipant;
