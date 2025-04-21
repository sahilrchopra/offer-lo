const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define Offer model
const Offer = sequelize.define(
  "Offer",
  {
    offer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    offer_slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    offer_name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "offers",
    timestamps: false,
  }
);

module.exports = Offer;
