const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SentEmail = sequelize.define(
  "SentEmail",
  {
    email_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    template_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    template_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipients_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failed_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "sent_emails",
    timestamps: true,
  }
);

module.exports = SentEmail;
