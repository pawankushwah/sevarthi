/**
 * Seed initial services data into MongoDB
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Service = require('./models/Service');
const Wallet = require('./models/Wallet');

const services = [
  // RIDES group
  { name: 'Bike Ride', icon: '🏍️', group: 'rides', category: 'Rides', pricingModel: 'per_km', basePrice: 20, perUnitRate: 8, description: 'Quick bike rides across the city' },
  { name: 'Auto Rickshaw', icon: '🛺', group: 'rides', category: 'Rides', pricingModel: 'per_km', basePrice: 30, perUnitRate: 12, description: 'Affordable auto rides' },
  { name: 'Cab', icon: '🚗', group: 'rides', category: 'Rides', pricingModel: 'per_km', basePrice: 50, perUnitRate: 16, description: 'Comfortable cab rides' },
  
  // QUICK group
  { name: 'Electrician', icon: '⚡', group: 'quick', category: 'Home Repair', pricingModel: 'per_hour', basePrice: 150, perUnitRate: 0, description: 'Licensed electrician for all electrical work' },
  { name: 'Plumber', icon: '🔧', group: 'quick', category: 'Home Repair', pricingModel: 'per_hour', basePrice: 150, perUnitRate: 0, description: 'Expert plumbers for leaks, fittings, and more' },
  { name: 'AC Repair', icon: '❄️', group: 'quick', category: 'Appliance', pricingModel: 'fixed', basePrice: 300, perUnitRate: 0, description: 'AC service, repair, and gas refill' },
  { name: 'Cleaning', icon: '🧹', group: 'quick', category: 'Cleaning', pricingModel: 'per_hour', basePrice: 100, perUnitRate: 0, description: 'Home and office deep cleaning' },
  { name: 'Appliance Repair', icon: '🔌', group: 'quick', category: 'Appliance', pricingModel: 'fixed', basePrice: 200, perUnitRate: 0, description: 'Washing machine, fridge, TV repairs' },
  { name: 'Pest Control', icon: '🐛', group: 'quick', category: 'Cleaning', pricingModel: 'fixed', basePrice: 500, perUnitRate: 0, description: 'Full home pest control treatment' },
  
  // EXTENDED group
  { name: 'Carpenter', icon: '🪚', group: 'extended', category: 'Construction', pricingModel: 'per_day', basePrice: 600, perUnitRate: 600, description: 'Custom furniture and woodwork' },
  { name: 'Mason', icon: '🧱', group: 'extended', category: 'Construction', pricingModel: 'per_day', basePrice: 700, perUnitRate: 700, description: 'Brick, cement, and tiling work' },
  { name: 'Painter', icon: '🎨', group: 'extended', category: 'Construction', pricingModel: 'per_day', basePrice: 500, perUnitRate: 500, description: 'Interior and exterior painting' },
  { name: 'Civil Worker', icon: '👷', group: 'extended', category: 'Construction', pricingModel: 'per_day', basePrice: 550, perUnitRate: 550, description: 'General civil construction work' },
  { name: 'Interior Designer', icon: '🏠', group: 'extended', category: 'Design', pricingModel: 'per_day', basePrice: 1500, perUnitRate: 1500, description: 'Professional interior design consultation' },
  { name: 'False Ceiling', icon: '🏗️', group: 'extended', category: 'Construction', pricingModel: 'per_day', basePrice: 800, perUnitRate: 800, description: 'POP and gypsum false ceiling work' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Wallet.deleteMany({});
    console.log('🧹 Cleared existing Users, Services, and Wallets');

    // Create Services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);

    const passwordHash = await bcrypt.hash('password', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Create Users
    const acRepairService = createdServices.find(s => s.name === 'AC Repair');

    const usersData = [
      {
        name: 'System Admin',
        phone: '0000000000',
        email: 'admin@sevarthi.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isApproved: true,
      },
      {
        name: 'Demo Customer',
        phone: '9999999999',
        email: 'customer@test.com',
        passwordHash: passwordHash,
        role: 'customer',
      },
      {
        name: 'Demo Provider',
        phone: '8888888888',
        email: 'provider@test.com',
        passwordHash: passwordHash,
        role: 'provider',
        isApproved: true,
        serviceId: acRepairService._id,
        serviceGroup: acRepairService.group,
        isAvailable: true,
        vehicleDetails: { type: 'Toolbox', number: 'NA-01', model: 'Professional' },
        location: { type: 'Point', coordinates: [72.877, 19.076] }
      }
    ];

    for (const uData of usersData) {
      const user = await User.create(uData);
      // Give customer 500 balance, others 0
      const initialBalance = user.role === 'customer' ? 500 : 0;
      await Wallet.create({ 
        userId: user._id, 
        balance: initialBalance, 
        transactions: initialBalance > 0 ? [{
          type: 'credit',
          amount: initialBalance,
          note: 'Welcome Bonus'
        }] : [] 
      });
      console.log(`👤 Created ${user.role}: ${user.phone}`);
    }

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
