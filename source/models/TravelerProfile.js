const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/sequelize");
const User = require("./User");

const TravelerProfile = db.define("TravelerProfile", {
  profile_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: "user_id",
    },
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  travel_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  interests: {
    type: DataTypes.TEXT,
  },    
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
});

module.exports = TravelerProfile;
