import mongoose from 'mongoose';
import dns from 'dns';

import User from './models/User.js';
import RoomType from './models/RoomType.js';
import Room from './models/Room.js';
import Guest from './models/Guest.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import { mockData } from './mockDb.js';

// Only adjust local DNS when not on Vercel
if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // Ignore fallback if custom DNS setting fails
  }
}

const autoSeedIfEmpty = async () => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log('🌱 Populating database with default seed data...');
      await RoomType.insertMany(mockData.roomTypes);
      await Room.insertMany(mockData.rooms);
      
      // Seed users individually so pre('save') bcrypt hook runs properly
      for (const u of mockData.users) {
        const existing = await User.findOne({ email: u.email });
        if (!existing) {
          await User.create(u);
        }
      }

      await Guest.insertMany(mockData.guests);
      await Booking.insertMany(mockData.bookings);
      await Payment.insertMany(mockData.payments);
      console.log('✅ Database auto-seeded successfully!');
    } else {
      // Ensure default users exist
      for (const u of mockData.users) {
        const existing = await User.findOne({ email: u.email });
        if (!existing) {
          await User.create(u);
        }
      }
    }
  } catch (err) {
    console.warn('Auto-seed note:', err.message);
  }
};

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms_db';

  try {
    // Attempt connection to MongoDB Atlas or Local MongoDB
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 10000 });
    console.log(`✅ Connected to MongoDB Database`);
    await autoSeedIfEmpty();
  } catch (err) {
    console.log('⚠️ Primary MongoDB connection failed:', err.message);
    
    // Only attempt embedded fallback in local environment
    if (!process.env.VERCEL) {
      try {
        const { MongoMemoryReplSet } = await import('mongodb-memory-server');
        const memReplSet = await MongoMemoryReplSet.create({
          binary: { version: '5.0.26' },
          replSet: { count: 1, name: 'hmsReplSet' }
        });
        const uri = memReplSet.getUri();
        await mongoose.connect(uri);
        console.log('✅ Connected to Embedded MongoDB Replica Set!');
        await autoSeedIfEmpty();
      } catch (memErr) {
        console.log('Embedded Mongo fallback failed:', memErr.message);
      }
    }
  }
};
