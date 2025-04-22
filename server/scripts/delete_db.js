// scripts/clearAdmins.js
const sequelize = require("../config/db");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Template = require("../models/Template");
const SentEmail = require("../models/SentEmail");

(async () => {
  await sequelize.authenticate();
  await Admin.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });
  await Template.destroy({ where: {}, truncate: true });
  await SentEmail.destroy({ where: {}, truncate: true });
  console.log("All admin, User, Template & SentEmail rows deleted");
  process.exit(0);
})().catch(console.error);
