const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ReviewsGuide = sequelize.define('ReviewsGuide', {
  review_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  guide_id: DataTypes.STRING,
  rating: DataTypes.INTEGER,
  review: DataTypes.TEXT,
}, {
  tableName: 'reviews_guides',
  timestamps: false,
});

module.exports = ReviewGuide;
