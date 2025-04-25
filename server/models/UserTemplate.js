const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserTemplate = sequelize.define(
  "UserTemplate",
  {
    user_template_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    template_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "user_templates",
    timestamps: false,
  }
);

module.exports = UserTemplate;
