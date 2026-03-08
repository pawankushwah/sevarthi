const User = require('../models/User');

// Map: socket.id -> userId
const socketUserMap = {};
// Map: userId -> socket.id
const userSocketMap = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Register user with socket
    socket.on('register', (userId) => {
      socketUserMap[socket.id] = userId;
      userSocketMap[userId] = socket.id;
      socket.join(`user_${userId}`);
      console.log(`User ${userId} registered to socket ${socket.id}`);
    });

    // Provider updates their location
    socket.on('location:update', async ({ userId, coordinates }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          'location.coordinates': coordinates,
        });
        // Broadcast to customer tracking this provider (handled per booking room)
        socket.broadcast.emit('location:updated', { userId, coordinates });
      } catch (err) {
        console.error('location:update error', err.message);
      }
    });

    // Join a booking room (both customer and provider)
    socket.on('join:booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
    });

    // Provider sends location update for active booking
    socket.on('booking:location', ({ bookingId, coordinates }) => {
      socket.to(`booking_${bookingId}`).emit('booking:provider_location', { coordinates });
    });

    socket.on('disconnect', () => {
      const userId = socketUserMap[socket.id];
      if (userId) {
        delete userSocketMap[userId];
        delete socketUserMap[socket.id];
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
};
