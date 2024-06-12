const { DataTypes } = require("sequelize");
const db = require("../config/sequelize");

const User = db.define(
  "User",
  {
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
    },
    balance: {
      type: DataTypes.INTEGER,
    },
    api_hit: {
      type: DataTypes.INTEGER,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "update_at",
    },
  },
  {
    tableName: "users",
    timestamps: false,
    underscored: true,
  }
);

module.exports = User;
