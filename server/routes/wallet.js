const express = require('express');
const Wallet = require('../models/Wallet');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/wallet/balance
router.get('/balance', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return res.json({ balance: 0, transactions: [] });
    res.json({ balance: wallet.balance, transactions: wallet.transactions.slice(-50).reverse() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wallet/recharge — Customer tops up (simulated)
router.post('/recharge', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user._id },
      {
        $inc: { balance: amount },
        $push: {
          transactions: {
            type: 'credit',
            amount,
            note: 'Wallet recharge',
          },
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.json({ balance: wallet.balance, message: 'Wallet recharged successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/wallet/deduct — Internal: handle unpaid ride penalty
router.post('/deduct', auth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const CUT_PERCENT = 0.1; // 10% fee for unpaid
    const penalty = Math.ceil(booking.fare * CUT_PERCENT);

    // Deduct from provider wallet as platform cut
    if (booking.providerId) {
      await Wallet.findOneAndUpdate(
        { userId: booking.providerId },
        {
          $inc: { balance: -penalty },
          $push: {
            transactions: {
              type: 'debit',
              amount: penalty,
              note: `Platform cut — unpaid booking #${booking._id}`,
              bookingId: booking._id,
            },
          },
        },
        { upsert: true }
      );
    }

    // Log outstanding debt on customer
    await User.findByIdAndUpdate(booking.customerId, {
      $inc: { outstandingDebt: booking.fare },
    });

    booking.paymentMethod = 'cash';
    booking.isPaid = false;
    booking.paymentNote = 'Marked unpaid — platform cut applied';
    await booking.save();

    res.json({ message: 'Unpaid booking processed', penalty });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
