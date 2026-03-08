const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '🔧' }, // emoji
  group: { type: String, enum: ['rides', 'quick', 'extended'], required: true },
  category: { type: String, default: '' }, // e.g. 'Home Repair', 'Rides'
  description: { type: String, default: '' },
  pricingModel: {
    type: String,
    enum: ['per_km', 'per_hour', 'per_day', 'fixed'],
    required: true,
  },
  basePrice: { type: Number, required: true }, // minimum/base charge
  perUnitRate: { type: Number, default: 0 }, // per km / hour / day
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
