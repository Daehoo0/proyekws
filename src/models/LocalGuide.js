const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const User = require("./User");

const LocalGuide = db.define(
  "LocalGuide",
  {
    guide_id: {
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
    location: {
      type: DataTypes.STRING,
    },
    experience: {
      type: DataTypes.TEXT,
    },
    rate: {
      type: DataTypes.INTEGER,
    },
    photo: {
      type: DataTypes.STRING,
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
    tableName: "guides",
    timestamps: false,
  }
);

module.exports = LocalGuide;
