const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const User = require("./User");

const Review = db.define(
  "Review",
  {
    review_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      references: {
        model: User,
        key: "user_id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
    },
    review: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    update_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "reviews",
    timestamps: false,
  }
);

module.exports = Review;
