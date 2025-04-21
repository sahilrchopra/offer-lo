// scripts/clearAdmins.js
// const sequelize = require("../config/db");
// const fs = require("fs");
// const path = require("path");

// (async () => {
//   await sequelize.authenticate();
//   // Drop all tables
//   await sequelize.drop();

//   // Delete the SQLite file
//   const dbFile = path.resolve(__dirname, "../email_engine.sqlite");
//   if (fs.existsSync(dbFile)) {
//     fs.unlinkSync(dbFile);
//     console.log("Database file deleted");
//   }

//   console.log("All tables dropped and database removed");
//   process.exit(0);
// })().catch(console.error);

// scripts/clearAdmins.js
const sequelize = require("../config/db");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Template = require("../models/Template");

(async () => {
  await sequelize.authenticate();
  await Admin.destroy({ where: {}, truncate: true });
  await User.destroy({ where: {}, truncate: true });
  await Template.destroy({ where: {}, truncate: true });
  console.log("All admin, User & Template rows deleted");
  process.exit(0);
})().catch(console.error);
