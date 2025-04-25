const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define User model
const User = sequelize.define(
  "User",
  {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_name: { type: DataTypes.STRING, allowNull: false },
    user_email: { type: DataTypes.STRING, allowNull: false, unique: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female'), allowNull: true },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;
