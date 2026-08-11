import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

import User from './models/User.js';
import RoomType from './models/RoomType.js';
import Room from './models/Room.js';
import Guest from './models/Guest.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';
import { mockData } from './mockDb.js';

const autoSeedIfEmpty = async () => {
  try {
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log('🌱 Populating database with default seed data...');
      await RoomType.insertMany(mockData.roomTypes);
      await Room.insertMany(mockData.rooms);
      
      // Seed users individually so pre('save') bcrypt hook runs properly for every user!
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
      // Ensure all mockData users exist in DB
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
  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hms_db';

  try {
    // Quick local MongoDB check
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 1500 });
    console.log(`✅ Connected to local MongoDB Database (${targetUri})`);
    await autoSeedIfEmpty();
  } catch (err) {
    console.log('⚠️ Local MongoDB server not active. Spawning embedded MongoDB Replica Set in background...');
    
    // Non-blocking background spawn so server starts instantly!
    MongoMemoryReplSet.create({
      binary: { version: '5.0.26' },
      replSet: { count: 1, name: 'hmsReplSet' }
    }).then(async (memReplSet) => {
      const uri = memReplSet.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to Embedded MongoDB Replica Set!');
      await autoSeedIfEmpty();
    }).catch(memErr => {
      console.log('Note: Embedded Mongo initializing in background:', memErr.message);
    });
  }
};
