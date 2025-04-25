const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const SentEmail = require('../models/SentEmail');

router.get('/history', authenticate, async (req, res) => {
  try {
    const emailHistory = await SentEmail.findAll({
      order: [['sent_at', 'DESC']],
      limit: 50,
    });
    res.json(emailHistory);
  } catch (error) {
    console.error('Error fetching email history:', error);
    res.status(500).json({ error: 'Failed to retrieve email history' });
  }
});

module.exports = router;