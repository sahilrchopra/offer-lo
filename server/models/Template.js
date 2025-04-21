const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define Template model
const Template = sequelize.define(
  "Template",
  {
    template_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    template_name: { type: DataTypes.STRING, allowNull: false },
    template_body: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "templates",
    timestamps: false,
  }
);

module.exports = Template;
