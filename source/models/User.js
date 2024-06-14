const { DataTypes } = require('sequelize');
const db = require('../config/sequelize');

const User = db.define('User', {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('traveler', 'guide', 'organizer'),
    allowNull: false
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = User;
