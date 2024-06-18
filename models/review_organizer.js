const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ReviewsOrganizer = sequelize.define('ReviewsOrganizer', {
  review_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  organizer_id: DataTypes.STRING,
  rating: DataTypes.INTEGER,
  review: DataTypes.TEXT,
}, {
  tableName: 'reviews_organizer',
  timestamps: false,
});

module.exports = ReviewOrganizer;
