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

// Connect to MongoDB Atlas
connectDB().catch(err => console.error('MongoDB Serverless connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HMS Backend operational on Vercel Serverless' });
});

export default app;
