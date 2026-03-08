const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceGroup: { type: String, enum: ['rides', 'quick', 'extended'], required: true },

  // Location
  pickup: {
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    address: { type: String, default: '' },
  },
  drop: {
    coordinates: { type: [Number], default: [0, 0] },
    address: { type: String, default: '' },
  },

  // Scheduling (mainly for extended)
  scheduledDate: { type: Date, default: null },
  scheduledTime: { type: String, default: '' },
  estimatedDays: { type: Number, default: 1 },

  // Status lifecycle
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'requested',
  },
  cancelledBy: { type: String, enum: ['customer', 'provider', 'admin', ''], default: '' },
  cancelReason: { type: String, default: '' },

  // Financials
  fare: { type: Number, default: 0 },
  distanceKm: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['upi', 'cash', 'wallet', ''], default: '' },
  isPaid: { type: Boolean, default: false },
  paymentNote: { type: String, default: '' },

  // Work content
  customerNotes: { type: String, default: '' },
  workNotes: { type: String, default: '' },
  customerImages: { type: [String], default: [] }, // Images from customer
  beforeImages: { type: [String], default: [] },
  afterImages: { type: [String], default: [] },

  // Rescheduling
  isRescheduled: { type: Boolean, default: false },
  originalSchedule: {
    date: { type: Date },
    time: { type: String }
  },

  // Rating
  rating: { type: Number, min: 1, max: 5, default: null },
  review: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
