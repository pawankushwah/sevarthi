const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  createdAt: { type: Date, default: Date.now },
});

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0 },
  transactions: [transactionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
