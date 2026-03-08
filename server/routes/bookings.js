const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Service = require('../models/Service');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Helper: calculate fare
const calcFare = (service, distanceKm = 0, days = 1) => {
  switch (service.pricingModel) {
    case 'per_km': return Math.max(service.basePrice, service.basePrice + service.perUnitRate * distanceKm);
    case 'per_hour': return service.basePrice;
    case 'per_day': return service.basePrice + service.perUnitRate * days;
    case 'fixed': return service.basePrice;
    default: return service.basePrice;
  }
};

// POST /api/bookings/request — Customer creates booking
router.post('/request', auth, requireRole('customer'), async (req, res) => {
  try {
    const { serviceId, pickup, drop, scheduledDate, scheduledTime, estimatedDays, customerNotes, distanceKm, customerImages } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const fare = calcFare(service, distanceKm || 0, estimatedDays || 1);

    const booking = await Booking.create({
      customerId: req.user._id,
      serviceId,
      serviceGroup: service.group,
      pickup, drop,
      scheduledDate, scheduledTime,
      estimatedDays: estimatedDays || 1,
      customerNotes: customerNotes || '',
      customerImages: customerImages || [],
      fare,
      distanceKm: distanceKm || 0,
      status: 'requested',
    });

    const populated = await booking.populate(['customerId', 'serviceId']);

    // Emit to socket (handled by socket handler via global io)
    const io = req.app.get('io');
    if (io) io.emit('booking:new', populated);

    res.status(201).json(populated);

    // Demo Mode Bot Setup
    if (req.headers['x-demo-mode'] === 'true') {
      setTimeout(async () => {
        try {
          let b = await Booking.findById(booking._id);
          if (!b || b.status !== 'requested') return;
          
          let botProvider = await User.findOne({ role: 'provider' });
          if (!botProvider) botProvider = await User.findOne(); // fallback to any user if no providers exist
          
          b.providerId = botProvider._id;
          b.status = 'confirmed';
          await b.save();

          const p = await b.populate(['customerId', 'providerId', 'serviceId']);
          if (io) io.to(`user_${b.customerId}`).emit('booking:accepted', p);

          // Simulate traveling/arriving
          setTimeout(async () => {
            b.status = 'in_progress';
            await b.save();
            if (io) io.to(`user_${b.customerId}`).emit('booking:status', { bookingId: b._id, status: 'in_progress' });

            // Simulate completion
            setTimeout(async () => {
              b.status = 'completed';
              await b.save();
              if (io) io.to(`user_${b.customerId}`).emit('booking:status', { bookingId: b._id, status: 'completed' });
            }, 6000);
          }, 5000);
        } catch (e) {
          console.error("Demo bot error:", e);
        }
      }, 3000);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings/simulate — Create a fake incoming request for Demo Mode
router.post('/simulate', auth, requireRole('provider'), async (req, res) => {
  try {
    if (req.headers['x-demo-mode'] !== 'true') return res.status(403).json({ message: 'Only in demo mode' });
    
    const service = await Service.findById(req.user.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    let botCustomer = await User.findOne({ role: 'customer' });
    if (!botCustomer) botCustomer = req.user; // fallback

    const booking = await Booking.create({
      customerId: botCustomer._id,
      serviceId: service._id,
      serviceGroup: service.group,
      pickup: { coordinates: [72.877, 19.076], address: 'Demo Location (Auto-generated)' },
      drop: service.category === 'Rides' ? { coordinates: [72.878, 19.077], address: 'Demo Destination' } : null,
      fare: service.basePrice + 55,
      status: 'requested'
    });

    const populated = await booking.populate(['customerId', 'serviceId']);

    const io = req.app.get('io');
    if (io) io.emit('booking:new', populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my — get logged-in user's bookings
router.get('/my', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'customer'
      ? { customerId: req.user._id }
      : { providerId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('serviceId').populate('customerId', 'name phone avatar')
      .populate('providerId', 'name phone avatar vehicleDetails')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/available — Provider sees open bookings for their service
router.get('/available', auth, requireRole('provider'), async (req, res) => {
  try {
    if (!req.user.isApproved) return res.status(403).json({ message: 'Account not approved yet' });
    const bookings = await Booking.find({
      serviceId: req.user.serviceId,
      status: 'requested',
      providerId: null,
    })
      .populate('serviceId').populate('customerId', 'name phone avatar')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId')
      .populate('customerId', 'name phone avatar')
      .populate('providerId', 'name phone avatar vehicleDetails upiId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/accept — Provider accepts
router.patch('/:id/accept', auth, requireRole('provider'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.status !== 'requested') return res.status(400).json({ message: 'Already taken' });

    booking.providerId = req.user._id;
    booking.status = 'confirmed';
    await booking.save();

    const populated = await booking.populate(['customerId', 'providerId', 'serviceId']);
    const io = req.app.get('io');
    if (io) io.to(`user_${booking.customerId}`).emit('booking:accepted', populated);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/status — Provider updates status
router.patch('/:id/status', auth, requireRole('provider'), async (req, res) => {
  try {
    const { status, workNotes, beforeImages, afterImages } = req.body;
    const allowed = ['in_progress', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (String(booking.providerId) !== String(req.user._id)) return res.status(403).json({ message: 'Not your booking' });

    booking.status = status;
    if (workNotes) booking.workNotes = workNotes;
    if (beforeImages) booking.beforeImages = beforeImages;
    if (afterImages) booking.afterImages = afterImages;
    await booking.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.customerId}`).emit('booking:status', { bookingId: booking._id, status });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/cancel — Customer or provider cancels
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });

    if (!['requested', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel at this stage' });
    }
    booking.status = 'cancelled';
    booking.cancelledBy = req.user.role;
    booking.cancelReason = reason || '';
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/payment — Mark payment
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentMethod } = req.body; // 'upi' | 'cash' | 'wallet'
    const booking = await Booking.findById(req.params.id).populate('providerId');
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
       // Note: Normally only completed, but allow confirmed for some cases if needed
       // Keeping it safe as per original logic which was 'completed'
       if (booking.status !== 'completed') return res.status(400).json({ message: 'Booking not completed' });
    }

    if (paymentMethod === 'wallet') {
      const customerWallet = await Wallet.findOne({ userId: req.user._id });
      if (!customerWallet || customerWallet.balance < booking.fare) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct from customer
      customerWallet.balance -= booking.fare;
      customerWallet.transactions.push({
        type: 'debit',
        amount: booking.fare,
        note: `Payment for booking #${booking._id}`,
        bookingId: booking._id,
      });
      await customerWallet.save();
    }

    booking.paymentMethod = paymentMethod;
    booking.isPaid = true;
    await booking.save();

    // Credit provider wallet
    if (booking.providerId) {
      await Wallet.findOneAndUpdate(
        { userId: booking.providerId._id },
        {
          $inc: { balance: booking.fare },
          $push: {
            transactions: {
              type: 'credit',
              amount: booking.fare,
              note: `Payment for booking #${booking._id} via ${paymentMethod}`,
              bookingId: booking._id,
            },
          },
        },
        { upsert: true }
      );
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/review — Customer submits review
router.patch('/:id/review', auth, requireRole('customer'), async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (String(booking.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Not your booking' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Booking not completed' });

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update provider avg rating
    if (booking.providerId) {
      const allBookings = await Booking.find({ providerId: booking.providerId, rating: { $ne: null } });
      const avg = allBookings.reduce((s, b) => s + b.rating, 0) / allBookings.length;
      await User.findByIdAndUpdate(booking.providerId, { rating: { avg: avg.toFixed(1), count: allBookings.length } });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/reschedule — Customer reschedules
router.patch('/:id/reschedule', auth, requireRole('customer'), async (req, res) => {
  try {
    const { scheduledDate, scheduledTime } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (String(booking.customerId) !== String(req.user._id)) return res.status(403).json({ message: 'Not your booking' });
    if (!['requested', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot reschedule at this stage' });
    }

    // Save original if first time rescheduling
    if (!booking.isRescheduled) {
      booking.isRescheduled = true;
      booking.originalSchedule = {
        date: booking.scheduledDate,
        time: booking.scheduledTime
      };
    }

    booking.scheduledDate = scheduledDate;
    booking.scheduledTime = scheduledTime;
    await booking.save();

    const io = req.app.get('io');
    if (io && booking.providerId) {
      io.to(`user_${booking.providerId}`).emit('booking:rescheduled', booking);
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
