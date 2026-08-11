import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { initSocket } from './socket.js';

import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import housekeepingRoutes from './routes/housekeepingRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
export const io = initSocket(server);

app.use(cors());
app.use(express.json());

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HMS Backend operational' });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 HMS Express Server running on http://localhost:${PORT}`);
    });
  });
}
