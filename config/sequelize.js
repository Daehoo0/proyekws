const Sequelize = require("sequelize");

const db = new Sequelize(
  "proyek_ws", //database name
  "root", //database username
  "", //database password
  {
    host: "localhost", //database host
    port: 3306, //default MySQL port
    dialect: 'mysql',
    logging: false 
  }
);

module.exports = db;
