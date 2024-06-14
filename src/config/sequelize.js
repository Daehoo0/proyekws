const Sequelize = require("sequelize");

const db = new Sequelize(
  "db_travels", //database name
  "root", //database username
  process.env.SQL_PASSWORD, //database password
  {
    host: "34.128.72.254", //database host
    dialect: "mysql",
  }
);

module.exports = db;
