const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const User = require("./models/User");
const Template = require("./models/Template");
const Offer = require("./models/Offer");
const UserTemplate = require("./models/UserTemplate");
const Admin = require("./models/Admin");
const bcrypt = require("bcrypt");
require("dotenv").config();

//associations
User.belongsToMany(Template, { through: UserTemplate, foreignKey: "user_id" });
Template.belongsToMany(User, {
  through: UserTemplate,
  foreignKey: "template_id",
});

const app = express();
app.use(cors());
app.use(express.json());


sequelize.sync({ force: true }).then(() => {
  console.log("Database synced");
  seed();
});

async function seed() {
  const adminCount = await Admin.count();
  if (!adminCount) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({
      username: "admin",
      password: hashedPassword,
    });
  }

  const userCount = await User.count();
  if (!userCount) {
    const users = [];
    users.push({
      user_name: "Sahil",
      user_email: "mailidhaisahil@gmail.com",
      city: "Delhi",
      state: "Delhi",
      gender: "male",
    });
    for (let i = 2; i <= 100; i++) {
      users.push({
        user_name: `User ${i}`,
        user_email: `user${i}@example.com`,
        city: `City${i}`,
        state: `State${i}`,
        gender: i % 2 === 0 ? 'female' : 'male',
      });
    }
    await User.bulkCreate(users);
  }

  const offerCount = await Offer.count();
  if (!offerCount) {
    await Offer.bulkCreate([
      { offer_slug: "offer1", offer_name: "Offer 1" },
      { offer_slug: "offer2", offer_name: "Offer 2" },
      { offer_slug: "offer3", offer_name: "Offer 3" },
    ]);
  }
}

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const templatesRoutes = require("./routes/templates");
const emailsRoutes = require("./routes/emails");
const assignRoutes = require("./routes/assign");

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/templates", templatesRoutes);
app.use("/api/emails", emailsRoutes);
app.use("/api/assign", assignRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
