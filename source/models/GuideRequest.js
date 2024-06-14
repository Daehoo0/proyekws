const { Sequelize, DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const Guide = require('./Guide');

const GuideRequest = db.define('GuideRequest', {
  request_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  traveler_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id',
    },
  },
  guide_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Guide,
      key: 'guide_id',
    },
  },
  request_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
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

module.exports = GuideRequest;
