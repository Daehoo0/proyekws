const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Traveler = require('./traveler');
const Guide = require('./guide');

const GuideRequest = sequelize.define('GuideRequest', {
  request_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  traveler_id: DataTypes.STRING,
  guide_id: DataTypes.STRING,
  request_date: DataTypes.DATE,
  message: DataTypes.TEXT,
  status: DataTypes.STRING,
}, {
  tableName: 'guide_requests',
  timestamps: false,
});

module.exports = GuideRequest;
