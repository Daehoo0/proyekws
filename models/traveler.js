const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Traveler = sequelize.define('Traveler', {
  traveler_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  name: DataTypes.STRING,
  password: DataTypes.STRING,
  jenis_kelamin: DataTypes.STRING,
  no_hp: DataTypes.STRING,
  saldo: DataTypes.INTEGER,
  photo: DataTypes.STRING,
}, {
  tableName: 'traveler',
  timestamps: false,
});

module.exports = Traveler;
