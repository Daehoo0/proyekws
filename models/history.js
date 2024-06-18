const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Event = require('./event');

const History = sequelize.define('History', {
  history_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  traveler_id: DataTypes.STRING,
  event_id: DataTypes.STRING,
}, {
  tableName: 'history',
  timestamps: false,
});


module.exports = History;
