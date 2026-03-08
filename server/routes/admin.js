const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/providers — list all providers (filter by approval)
router.get('/providers', auth, requireRole('admin'), async (req, res) => {
  try {
    const { approved } = req.query;
    const filter = { role: 'provider' };
    if (approved !== undefined) filter.isApproved = approved === 'true';
    const providers = await User.find(filter).populate('serviceId').select('-passwordHash');
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/providers/:id/approve
router.patch('/providers/:id/approve', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { returnDocument: 'after' }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'Provider not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/providers/:id/reject
router.patch('/providers/:id/reject', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { returnDocument: 'after' }
    ).select('-passwordHash');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [totalBookings, completedBookings, totalProviders, pendingProviders, totalCustomers] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'provider', isApproved: false }),
      User.countDocuments({ role: 'customer' }),
    ]);

    const revenueData = await Booking.aggregate([
      { $match: { status: 'completed', isPaid: true } },
      { $group: { _id: null, total: { $sum: '$fare' } } },
    ]);

    res.json({
      totalBookings,
      completedBookings,
      totalProviders,
      pendingProviders,
      totalCustomers,
      totalRevenue: revenueData[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', auth, requireRole('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name phone')
      .populate('providerId', 'name phone')
      .populate('serviceId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/customers
router.get('/customers', auth, requireRole('admin'), async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-passwordHash');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Review Moderation ---

// GET /api/admin/reviews — List all reviews
router.get('/reviews', auth, requireRole('admin'), async (req, res) => {
  try {
    const reviews = await Booking.find({ rating: { $ne: null } })
      .populate('customerId', 'name')
      .populate('providerId', 'name')
      .populate('serviceId', 'name')
      .sort({ updatedAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/reviews/:id — Remove a review (moderation)
router.delete('/reviews/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const providerId = booking.providerId;
    booking.rating = null;
    booking.review = '';
    await booking.save();

    // Recalculate provider avg rating
    if (providerId) {
      const allBookings = await Booking.find({ providerId: providerId, rating: { $ne: null } });
      let avg = 0;
      let count = 0;
      if (allBookings.length > 0) {
        avg = (allBookings.reduce((s, b) => s + b.rating, 0) / allBookings.length).toFixed(1);
        count = allBookings.length;
      }
      await User.findByIdAndUpdate(providerId, { rating: { avg, count } });
    }

    res.json({ message: 'Review removed and rating recalculated', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Service Management ---

// POST /api/admin/services — Create new service
router.post('/services', auth, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/services/:id — Update service
router.patch('/services/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/services/:id — Delete service
router.delete('/services/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
