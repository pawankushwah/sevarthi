import { io } from 'socket.io-client';

// In production use the full backend URL; in dev, proxy handles it
const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
});

export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.on('connect', () => {
      socket.emit('register', userId);
    });
    // If already connected, emit immediately
    if (socket.connected) socket.emit('register', userId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;
