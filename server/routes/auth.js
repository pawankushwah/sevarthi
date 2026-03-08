const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, role, serviceId, serviceGroup, vehicleDetails, upiId } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, phone, email, passwordHash, role: role || 'customer',
      serviceId: serviceId || null,
      serviceGroup: serviceGroup || '',
      vehicleDetails: vehicleDetails || {},
      upiId: upiId || '',
    });

    // Create wallet for everyone
    await Wallet.create({ userId: user._id, balance: 0, transactions: [] });

    const token = generateToken(user._id);
    const { passwordHash: _, ...userData } = user.toObject();
    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    const { passwordHash: _, ...userData } = user.toObject();
    res.json({ token, user: userData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').auth, async (req, res) => {
  res.json(req.user);
});

// PATCH /api/auth/me/availability — provider toggle online/offline
router.patch('/me/availability', require('../middleware/auth').auth, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isAvailable },
      { returnDocument: 'after' }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/me — Update basic profile info
router.patch('/me', require('../middleware/auth').auth, async (req, res) => {
  try {
    const { name, email, phone, serviceId, upiId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (serviceId) updates.serviceId = serviceId;
    if (upiId) updates.upiId = upiId;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { returnDocument: 'after' }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
