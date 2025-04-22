const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const User = require("./models/User");
const Template = require("./models/Template");
const Offer = require("./models/Offer");
const UserTemplate = require("./models/UserTemplate");
const Admin = require("./models/Admin");
const SentEmail = require("./models/SentEmail");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
// Debug loaded SMTP env vars
console.log(
  `EMAIL_HOST=${process.env.EMAIL_HOST}`,
  `EMAIL_PORT=${process.env.EMAIL_PORT}`,
  `EMAIL_SECURE=${process.env.EMAIL_SECURE}`
);

// Define associations
User.belongsToMany(Template, { through: UserTemplate, foreignKey: "user_id" });
Template.belongsToMany(User, {
  through: UserTemplate,
  foreignKey: "template_id",
});

// Mail transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // For local development/testing without actually sending emails
    // Comment this out in production
    tls: { rejectUnauthorized: false },
  });

  // Verify transporter configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log("SMTP connection error:", error);
    } else {
      console.log("SMTP server is ready to send emails");
    }
  });
} catch (error) {
  console.error("Email transporter setup failed:", error);
}

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth Middleware
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Sync and seed
sequelize.sync().then(() => {
  console.log("Database synced");
  seed();
});

async function seed() {
  // Seed admin
  const adminCount = await Admin.count();
  if (!adminCount) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await Admin.create({
      username: "admin",
      password: hashedPassword,
    });
    console.log("Admin user created");
  }

  // Seed users
  const userCount = await User.count();
  if (!userCount) {
    const users = [];
    users.push({
      user_name: "Sahil",
      user_email: "mailidhaisahil@gmail.com",
    });
    for (let i = 2; i <= 100; i++) {
      users.push({
        user_name: `User ${i}`,
        user_email: `user${i}@example.com`,
      });
    }
    await User.bulkCreate(users);
  }

  // Seed offers
  const offerCount = await Offer.count();
  if (!offerCount) {
    await Offer.bulkCreate([
      { offer_slug: "offer1", offer_name: "Offer 1" },
      { offer_slug: "offer2", offer_name: "Offer 2" },
      { offer_slug: "offer3", offer_name: "Offer 3" },
    ]);
  }
}

// Auth Routes
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ adminId: admin.admin_id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected Routes
app.get("/api/users", authenticate, async (_, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.get("/api/templates", authenticate, async (_, res) => {
  const templates = await Template.findAll();
  res.json(templates);
});

app.post("/api/templates", authenticate, async (req, res) => {
  const { template_name, template_body } = req.body;
  const template = await Template.create({ template_name, template_body });
  res.json(template);
});

app.put("/api/templates/:id", authenticate, async (req, res) => {
  const id = req.params.id;
  const { template_name, template_body } = req.body;
  await Template.update(
    { template_name, template_body },
    { where: { template_id: id } }
  );
  const updated = await Template.findByPk(id);
  res.json(updated);
});

// Get sent emails history
app.get("/api/emails/history", authenticate, async (req, res) => {
  try {
    const emailHistory = await SentEmail.findAll({
      order: [["sent_at", "DESC"]],
      limit: 50,
    });
    res.json(emailHistory);
  } catch (error) {
    console.error("Error fetching email history:", error);
    res.status(500).json({ error: "Failed to retrieve email history" });
  }
});

app.post("/api/assign", authenticate, async (req, res) => {
  const { template_id, user_ids } = req.body;

  try {
    const template = await Template.findByPk(template_id);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const emailRecord = await SentEmail.create({
      template_id,
      template_name: template.template_name,
      recipients_count: user_ids.length,
      success_count: 0,
      failed_count: 0,
    });

    const results = {
      success: [],
      failed: [],
    };

    const personalizeTemplate = (templateText, userData) => {
      let personalized = templateText;
      personalized = personalized.replace(
        /{{(name|user_name)}}/gi,
        userData.user_name
      );
      return personalized;
    };

    // Process each recipient
    for (const uid of user_ids) {
      try {
        const user = await User.findByPk(uid);
        if (!user) {
          results.failed.push({
            user_id: uid,
            reason: "User not found",
          });
          continue;
        }

        await UserTemplate.findOrCreate({
          where: { user_id: uid, template_id },
        });

        const personalizedBody = personalizeTemplate(
          template.template_body,
          user
        );

        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER || "noreply@emailengine.com",
            to: user.user_email,
            subject: template.template_name,
            text: personalizedBody,
          });

          results.success.push({
            user_id: uid,
            email: user.user_email,
            name: user.user_name,
          });
        } else {
          throw new Error("Email transporter not configured");
        }
      } catch (error) {
        console.error(`Error sending email to user ${uid}:`, error);
        results.failed.push({
          user_id: uid,
          reason: error.message || "Failed to send email",
        });
      }
    }

    await emailRecord.update({
      success_count: results.success.length,
      failed_count: results.failed.length,
    });

    res.json({
      id: emailRecord.email_id,
      message: "Email process completed",
      sent_at: emailRecord.sent_at,
      template: template.template_name,
      success_count: results.success.length,
      failed_count: results.failed.length,
      details: results,
    });
  } catch (error) {
    console.error("Error in email sending process:", error);
    res.status(500).json({
      error: "Email sending process failed",
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
