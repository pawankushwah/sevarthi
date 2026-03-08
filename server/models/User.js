const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },

  // Provider-only fields
  isApproved: { type: Boolean, default: false },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', default: null },
  serviceGroup: { type: String, enum: ['rides', 'quick', 'extended', ''], default: '' },
  vehicleDetails: {
    type: { type: String, default: '' },
    number: { type: String, default: '' },
    model: { type: String, default: '' },
  },
  upiId: { type: String, default: '' },
  isAvailable: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  rating: {
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  // Customer-only fields
  outstandingDebt: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
