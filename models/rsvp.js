const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Event = require('./event');

const Rsvp = sequelize.define('Rsvp', {
  rsvp_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  traveler_id: DataTypes.STRING,
  event_id: DataTypes.STRING,
}, {
  tableName: 'rsvp',
  timestamps: false,
});

module.exports = RSVP;
