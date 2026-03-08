const express = require('express');
const Service = require('../models/Service');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/services  —  list all active services
router.get('/', async (req, res) => {
  try {
    const { group, search } = req.query;
    const filter = { isActive: true };
    if (group) filter.group = group;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const services = await Service.find(filter).sort('group name');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/services  —  admin only
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/services/:id  —  admin only
router.patch('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
