const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./email_engine.sqlite",
  logging: false,
});

module.exports = sequelize;
