import mongoose from 'mongoose';
import dns from 'dns';

import User from './models/User.js';
import RoomType from './models/RoomType.js';
import Room from './models/Room.js';
import Guest from './models/Guest.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import { mockData } from './mockDb.js';

// Configure DNS resolution for MongoDB Atlas SRV lookup compatibility
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS server override is restricted
}

let isSeeded = false;

const autoSeedIfEmpty = async () => {
  if (isSeeded) return;
  try {
    const roomExists = await Room.exists({});
    if (!roomExists) {
      console.log('🌱 Populating database with default seed data...');
      await RoomType.insertMany(mockData.roomTypes);
      await Room.insertMany(mockData.rooms);
      
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
      for (const u of mockData.users) {
        const existing = await User.findOne({ email: u.email });
        if (!existing) {
          await User.create(u);
        }
      }
    }
    isSeeded = true;
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
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 4000 });
    console.log(`✅ Connected to MongoDB Database`);
    await autoSeedIfEmpty();
  } catch (err) {
    console.log('⚠️ MongoDB connection error:', err.message);
    
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
