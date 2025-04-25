const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Template = require('../models/Template');

router.get('/', authenticate, async (req, res) => {
  try {
    const templates = await Template.findAll();
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new template
router.post('/', authenticate, async (req, res) => {
  const { template_name, template_body } = req.body;
  try {
    const template = await Template.create({ template_name, template_body });
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update template
router.put('/:id', authenticate, async (req, res) => {
  const id = req.params.id;
  const { template_name, template_body } = req.body;
  try {
    await Template.update(
      { template_name, template_body },
      { where: { template_id: id } }
    );
    const updated = await Template.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;