import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from '../src/db.js';

import authRoutes from '../src/routes/authRoutes.js';
import roomRoutes from '../src/routes/roomRoutes.js';
import bookingRoutes from '../src/routes/bookingRoutes.js';
import guestRoutes from '../src/routes/guestRoutes.js';
import billingRoutes from '../src/routes/billingRoutes.js';
import housekeepingRoutes from '../src/routes/housekeepingRoutes.js';
import reportsRoutes from '../src/routes/reportsRoutes.js';
import settingRoutes from '../src/routes/settingRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serverless DB connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingRoutes);

// Health checks
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HMS Backend operational on Vercel Serverless' });
});

app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'HMS Express Server running on Vercel Serverless' });
});

export default app;
