const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Event = require('./event');

const EventParticipant = sequelize.define('EventParticipant', {
  event_participant_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  event_id: DataTypes.STRING,
  traveler_id: DataTypes.STRING,
  guide_id: DataTypes.STRING,
}, {
  tableName: 'event_participants',
  timestamps: false,
});

module.exports = EventParticipant;
