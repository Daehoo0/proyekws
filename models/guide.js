const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Guide = sequelize.define('Guide', {
  guide_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  jenis_kelamin: DataTypes.STRING,
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  name: DataTypes.STRING,
  password: DataTypes.STRING,
  no_hp: DataTypes.STRING,
  location: DataTypes.STRING,
  experience: DataTypes.TEXT,
  rate: DataTypes.INTEGER,
  photo: DataTypes.STRING,
  saldo: DataTypes.INTEGER,
}, {
  tableName: 'guides',
  timestamps: false,
});

module.exports = Guide;
