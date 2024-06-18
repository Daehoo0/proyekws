const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ReviewsTraveller = sequelize.define('ReviewsTraveller', {
  review_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  traveler_id: DataTypes.STRING,
  rating: DataTypes.INTEGER,
  review: DataTypes.TEXT,
}, {
  tableName: 'reviews_travellers',
  timestamps: false,
});

module.exports = ReviewTraveller;
