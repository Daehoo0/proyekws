const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Organizer = sequelize.define('Organizer', {
  organizer_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  location: DataTypes.STRING,
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  name: DataTypes.STRING,
  password: DataTypes.STRING,
  no_hp: DataTypes.STRING,
  rate: DataTypes.INTEGER,
  photo: DataTypes.STRING,
  saldo: DataTypes.INTEGER,
}, {
  tableName: 'organizer',
  timestamps: false,
});

module.exports = Organizer;
