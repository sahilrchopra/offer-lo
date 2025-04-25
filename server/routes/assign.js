const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Template = require('../models/Template');
const User = require('../models/User');
const UserTemplate = require('../models/UserTemplate');
const SentEmail = require('../models/SentEmail');
const transporter = require('../config/transporter');

router.post('/', authenticate, async (req, res) => {
  const { template_id, user_ids } = req.body;

  try {
    const template = await Template.findByPk(template_id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    const emailRecord = await SentEmail.create({
      template_id,
      template_name: template.template_name,
      recipients_count: user_ids.length,
      success_count: 0,
      failed_count: 0,
    });

    const results = { success: [], failed: [] };

    const personalizeTemplate = (templateText, userData) => {
      return templateText.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
        switch (key.toLowerCase()) {
          case 'name':
          case 'user_name':
            return userData.user_name;
          case 'city':
            return userData.city || '';
          case 'state':
            return userData.state || '';
          case 'pronoun':
            return userData.gender === 'male' ? 'He' : 'She';
          case 'pronoun_lower':
            return userData.gender === 'male' ? 'he' : 'she';
          default:
            return match;
        }
      });
    };

    for (const uid of user_ids) {
      try {
        const user = await User.findByPk(uid);
        if (!user) {
          results.failed.push({ user_id: uid, reason: 'User not found' });
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
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.user_email,
            subject: template.template_name,
            html: personalizedBody                            
          });
          results.success.push({ user_id: uid, email: user.user_email, name: user.user_name });
        } else {
          throw new Error('Email transporter not configured');
        }
      } catch (error) {
        console.error(`Error sending email to user ${uid}:`, error);
        results.failed.push({ user_id: uid, reason: error.message || 'Failed to send email' });
      }
    }

    await emailRecord.update({
      success_count: results.success.length,
      failed_count: results.failed.length,
    });

    res.json({
      id: emailRecord.email_id,
      message: 'Email process completed',
      sent_at: emailRecord.sent_at,
      template: template.template_name,
      success_count: results.success.length,
      failed_count: results.failed.length,
      details: results,
    });
  } catch (error) {
    console.error('Error in email sending process:', error);
    res.status(500).json({ error: 'Email sending process failed', message: error.message });
  }
});

module.exports = router;