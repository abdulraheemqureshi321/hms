import dotenv from 'dotenv';
import { connectDB } from './db.js';
import User from './models/User.js';
import RoomType from './models/RoomType.js';
import Room from './models/Room.js';
import Guest from './models/Guest.js';
import Booking from './models/Booking.js';
import Payment from './models/Payment.js';

dotenv.config();

async function seedData() {
  try {
    await connectDB();
    console.log('🌱 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await RoomType.deleteMany({});
    await Room.deleteMany({});
    await Guest.deleteMany({});
    await Booking.deleteMany({});
    await Payment.deleteMany({});

    console.log('🧹 Cleared existing database collections.');

    // 1. Create Default Users
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@hms.com',
      password: 'admin123',
      role: 'Admin',
      permissions: []
    });

    const managerUser = await User.create({
      name: 'Sarah Jenkins (Manager)',
      email: 'manager@hms.com',
      password: 'manager123',
      role: 'Manager',
      created_by: adminUser._id,
      permissions: [
        { module: 'bookings', actions: ['view', 'create', 'edit', 'delete'] },
        { module: 'rooms', actions: ['view', 'create', 'edit'] },
        { module: 'guests', actions: ['view', 'create', 'edit'] },
        { module: 'billing', actions: ['view', 'create', 'edit'] },
        { module: 'housekeeping', actions: ['view', 'edit'] },
        { module: 'reports', actions: ['view'] },
        { module: 'staff', actions: ['view', 'create', 'edit'] }
      ]
    });

    const receptionistUser = await User.create({
      name: 'Michael Scott (Reception)',
      email: 'receptionist@hms.com',
      password: 'staff123',
      role: 'Receptionist',
      created_by: managerUser._id,
      permissions: [
        { module: 'bookings', actions: ['view', 'create', 'edit'] },
        { module: 'guests', actions: ['view', 'create', 'edit'] },
        { module: 'billing', actions: ['view', 'create'] },
        { module: 'rooms', actions: ['view'] }
      ]
    });

    const housekeepingUser = await User.create({
      name: 'Elena Rostova (Housekeeping)',
      email: 'housekeeping@hms.com',
      password: 'staff123',
      role: 'Housekeeping',
      created_by: managerUser._id,
      permissions: [
        { module: 'housekeeping', actions: ['view', 'edit'] }
      ]
    });

    const guestUser = await User.create({
      name: 'Alexander Wright',
      email: 'alex@example.com',
      password: 'guest123',
      role: 'Guest',
      permissions: []
    });

    console.log('✅ Created Staff & Guest Users.');

    // 2. Create Guest Profile
    const sampleGuest = await Guest.create({
      user: guestUser._id,
      name: 'Alexander Wright',
      email: 'alex@example.com',
      phone: '+1 555-0192',
      idType: 'Passport',
      idNumber: 'A98210392',
      address: '100 Broadway Ave, New York, NY'
    });

    await Guest.create({
      name: 'Claire Vance',
      email: 'claire.vance@gmail.com',
      phone: '+1 555-0841',
      idType: 'CNIC/National ID',
      idNumber: '35202-9182301-1',
      address: '42 Main St, Chicago, IL'
    });

    // 3. Create Room Types
    const singleType = await RoomType.create({
      name: 'Boutique Deluxe Single',
      basePrice: 140,
      capacity: 1,
      description: 'Cozy modern boutique room with queen bed, high-speed Wi-Fi, ambient warm lighting, and city view.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '4K Smart TV', 'Espresso Bar', 'Work Desk'],
      photos: ['/boutique_single.png']
    });

    const doubleType = await RoomType.create({
      name: 'Executive King Deluxe',
      basePrice: 220,
      capacity: 2,
      description: 'Spacious double suite featuring king size bed, custom marble bathroom, executive desk, and rainfall shower.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '55" OLED TV', 'Mini Bar & Cellar', 'In-room Safe', 'Marble Bathtub'],
      photos: ['/executive_deluxe.png']
    });

    const suiteType = await RoomType.create({
      name: 'Presidential Ocean Suite',
      basePrice: 450,
      capacity: 4,
      description: 'Opulent suite with private ocean view balcony, living lounge, master king bed, jacuzzi, and 24/7 room service.',
      amenities: ['High-Speed Wi-Fi', 'Climate Control AC', '65" OLED TV', 'Private Bar', 'Panoramic Balcony', 'Jacuzzi', '24/7 Butler Service'],
      photos: ['/luxury_suite.png']
    });

    console.log('✅ Created Room Types.');

    // 4. Create Rooms
    const room101 = await Room.create({ roomNumber: '101', roomType: singleType._id, floor: 1, status: 'Reserved', cleaningStatus: 'Clean' });
    await Room.create({ roomNumber: '102', roomType: singleType._id, floor: 1, status: 'Available', cleaningStatus: 'Clean' });
    await Room.create({ roomNumber: '201', roomType: doubleType._id, floor: 2, status: 'Occupied', cleaningStatus: 'Clean' });
    await Room.create({ roomNumber: '202', roomType: doubleType._id, floor: 2, status: 'Available', cleaningStatus: 'Dirty' });
    await Room.create({ roomNumber: '301', roomType: suiteType._id, floor: 3, status: 'Available', cleaningStatus: 'Clean' });

    console.log('✅ Created Rooms.');

    // 5. Create Sample Booking
    const today = new Date();
    const checkOut = new Date();
    checkOut.setDate(today.getDate() + 3);

    const booking1 = await Booking.create({
      bookingCode: 'HMS-DEMO-001',
      guest: sampleGuest._id,
      room: room101._id,
      roomType: singleType._id,
      checkInDate: today,
      checkOutDate: checkOut,
      guestsCount: 1,
      status: 'Confirmed',
      source: 'portal',
      totalAmount: 396,
      specialRequests: 'High floor preferred, extra pillows'
    });

    await Payment.create({
      booking: booking1._id,
      amount: 396,
      taxAmount: 36,
      paymentMethod: 'card',
      paymentStatus: 'Paid',
      transactionId: 'TXN-SEED-9021'
    });

    console.log('🌱 Seed Data Population Complete!');
    console.log('----------------------------------------------------');
    console.log('Admin Account:        admin@hms.com / admin123');
    console.log('Manager Account:      manager@hms.com / manager123');
    console.log('Receptionist Account: receptionist@hms.com / staff123');
    console.log('Housekeeping Account: housekeeping@hms.com / staff123');
    console.log('Guest Portal Account: alex@example.com / guest123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Failed:', error);
    process.exit(1);
  }
}

seedData();
