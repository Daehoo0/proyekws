const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const User = require("./User");

const Event = db.define(
  "Event",
  {
    event_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    organizer_id: {
      type: DataTypes.STRING,
      references: {
        model: User,
        key: "user_id",
      },
    },
    event_name: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    event_time: {
      type: DataTypes.DATE,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: "events",
    timestamps: false,
  }
);

module.exports = Event;
