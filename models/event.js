const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Organizer = require('./organizer');

const Event = sequelize.define('Event', {
  event_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  organizer_id: DataTypes.STRING,
  event_name: DataTypes.STRING,
  category: DataTypes.STRING,
  location: DataTypes.STRING,
  event_time: DataTypes.DATE,
  description: DataTypes.TEXT,
  photo: DataTypes.STRING,
  harga: DataTypes.INTEGER,
  status: DataTypes.STRING,
}, {
  tableName: 'events',
  timestamps: false,
});

module.exports = Event;
